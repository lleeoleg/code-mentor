import json
import urllib.parse
import urllib.request
import uuid
from datetime import timedelta
from io import BytesIO
from django.conf import settings
from django.contrib.auth.models import User
from django.db.models import Q
from django.db import transaction
from django.db.utils import OperationalError
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.views import View
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView as JWTTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView as JWTTokenRefreshView

from .models import (
    Course,
    NewsItem,
    Module,
    Lesson,
    Enrollment,
    CourseFavorite,
    LessonCompletion,
    Comment,
    CourseExam,
    ExamAttempt,
    ExamQuestion,
    ExamChoice,
    ExamAnswer,
    CourseCertificate,
)
from .serializers import (
    UserRegisterSerializer,
    UserMeSerializer,
    CourseSerializer,
    NewsItemSerializer,
    ModuleSerializer,
    LessonDetailSerializer,
    EnrollmentSerializer,
    CommentSerializer,
    CommentCreateSerializer,
    CourseExamInfoSerializer,
    ExamQuestionPublicSerializer,
    ExamSubmitSerializer,
)


class TokenObtainPairView(JWTTokenObtainPairView):
    """Выдача JWT по username/password. Без AllowAny логин блокируется глобальным IsAuthenticated."""
    permission_classes = (AllowAny,)


class TokenRefreshView(JWTTokenRefreshView):
    """Обновление access по refresh. Разрешаем без авторизации (передаётся refresh в body)."""
    permission_classes = (AllowAny,)


class RegisterView(generics.CreateAPIView):
    """Регистрация нового пользователя."""
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = (AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
        }, status=status.HTTP_201_CREATED)


class CurrentUserView(generics.RetrieveUpdateAPIView):
    """Текущий пользователь: GET — данные, PATCH — обновить email."""
    serializer_class = UserMeSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        user = request.user
        new_email = request.data.get('email')
        if new_email is not None:
            user.email = new_email.strip()
            user.save()
        serializer = self.get_serializer(user)
        return Response(serializer.data)


class SetPasswordView(generics.GenericAPIView):
    """Установка/смена пароля для текущего пользователя."""
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        new_password = request.data.get('new_password')
        new_password_confirm = request.data.get('new_password_confirm')
        if not new_password:
            return Response(
                {'new_password': ['Обязательное поле.']},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if new_password != new_password_confirm:
            return Response(
                {'new_password_confirm': ['Пароли не совпадают.']},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            validate_password(new_password, request.user)
        except ValidationError as e:
            return Response(
                {'new_password': list(e.messages)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        request.user.set_password(new_password)
        request.user.save()
        return Response({'detail': 'Пароль успешно изменён.'}, status=status.HTTP_200_OK)


class CourseListAPIView(generics.ListAPIView):
    """Список курсов. Доступен без авторизации (каталог для всех).
    Фильтры:
    - price_type: free — бесплатные (нет цены или 0), certificate — с сертификатом (есть цена).
    - level: beginner, intermediate, advanced, all — по уровню сложности.
    - q: поиск по названию и описанию (без учёта регистра, по вхождению фразы и по словам).
    """
    serializer_class = CourseSerializer
    permission_classes = (AllowAny,)
    authentication_classes = ()  # не проверяем JWT — избегаем 500 при невалидном токене

    def get_queryset(self):
        qs = Course.objects.all()
        price_type = self.request.query_params.get('price_type', '').strip().lower()
        if price_type == 'free':
            qs = qs.filter(Q(price__isnull=True) | Q(price=0))
        elif price_type == 'certificate':
            qs = qs.filter(price__isnull=False).exclude(price=0)
        level = self.request.query_params.get('level', '').strip().lower()
        if level and level in ('beginner', 'intermediate', 'advanced', 'all'):
            qs = qs.filter(level=level)
        search_q = self.request.query_params.get('q', '').strip()
        if search_q:
            q_lower = search_q.lower()
            words = [w for w in q_lower.split() if w]
            if words:
                for word in words:
                    qs = qs.filter(
                        Q(title__icontains=word) | Q(description__icontains=word)
                    )
        return qs


class CourseDetailAPIView(generics.RetrieveAPIView):
    """Детали одного курса. Доступно без авторизации."""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = (AllowAny,)
    authentication_classes = ()


class CourseExamInfoView(generics.GenericAPIView):
    """Информация о финальном тесте и статусе пользователя."""
    permission_classes = (AllowAny,)

    def get(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
        exam = getattr(course, 'final_exam', None)
        if not exam or not exam.is_active:
            return Response({'has_exam': False})

        data = CourseExamInfoSerializer(exam).data

        attempts_limit = 50  # временно для тестирования
        attempts_left = attempts_limit
        reset_at = None
        attempts_recent = []
        last_attempt = None
        has_certificate = False
        if request.user and request.user.is_authenticated:
            since = timezone.now() - timedelta(hours=3)
            window_qs = ExamAttempt.objects.filter(exam=exam, user=request.user, started_at__gte=since).order_by('started_at')
            used = window_qs.count()
            attempts_left = max(0, attempts_limit - used)
            if used >= attempts_limit:
                first_in_window = window_qs.first()
                if first_in_window:
                    reset_at = first_in_window.started_at + timedelta(hours=3)

            la = ExamAttempt.objects.filter(exam=exam, user=request.user).order_by('-started_at').first()
            if la:
                last_attempt = {
                    'id': la.id,
                    'status': la.status,
                    'score_percent': la.score_percent,
                    'started_at': la.started_at,
                    'submitted_at': la.submitted_at,
                }
            attempts_recent = [
                {
                    'id': a.id,
                    'status': a.status,
                    'score_percent': a.score_percent,
                    'started_at': a.started_at,
                    'submitted_at': a.submitted_at,
                }
                for a in ExamAttempt.objects.filter(exam=exam, user=request.user).order_by('-started_at')[:10]
            ]
            has_certificate = CourseCertificate.objects.filter(course=course, user=request.user).exists()

        return Response({
            'has_exam': True,
            'exam': data,
            'attempts_left_24h': attempts_left,
            'attempts_reset_at': reset_at,
            'attempts_recent': attempts_recent,
            'last_attempt': last_attempt,
            'has_certificate': has_certificate,
        })


class CourseExamStartView(generics.GenericAPIView):
    """Старт финального теста. Создаёт попытку и отдаёт вопросы."""
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
        exam = getattr(course, 'final_exam', None)
        if not exam or not exam.is_active:
            return Response({'detail': 'Тест недоступен.'}, status=status.HTTP_404_NOT_FOUND)

        # Лимит попыток: временно увеличен для тестирования.
        since = timezone.now() - timedelta(hours=3)
        window_qs = ExamAttempt.objects.filter(exam=exam, user=request.user, started_at__gte=since).order_by('started_at')
        used = window_qs.count()
        if used >= 50:
            first_in_window = window_qs.first()
            reset_at = (first_in_window.started_at + timedelta(hours=3)) if first_in_window else None
            return Response(
                {
                    'detail': 'Лимит попыток: 50 за последние 3 часа.',
                    'attempts_reset_at': reset_at,
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        try:
            questions = list(
                exam.questions.prefetch_related('choices')
                .all()
                .order_by('order', 'id')[: exam.questions_count]
            )
        except OperationalError:
            return Response(
                {
                    'detail': 'База данных не обновлена под новые поля тестов. Примените миграции.',
                    'hint': 'python manage.py migrate',
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        if len(questions) < 1:
            return Response({'detail': 'В тесте пока нет вопросов.'}, status=status.HTTP_409_CONFLICT)

        attempt = ExamAttempt.objects.create(
            exam=exam,
            user=request.user,
            status=ExamAttempt.Status.IN_PROGRESS,
            max_questions=min(exam.questions_count, len(questions)),
        )

        return Response({
            'attempt': {
                'id': attempt.id,
                'status': attempt.status,
                'started_at': attempt.started_at,
            },
            'exam': CourseExamInfoSerializer(exam).data,
            'questions': ExamQuestionPublicSerializer(questions, many=True, context={'request': request}).data,
        })


class ExamAttemptSubmitView(generics.GenericAPIView):
    """Отправка ответов и подсчёт результата."""
    permission_classes = (IsAuthenticated,)
    serializer_class = ExamSubmitSerializer

    def post(self, request, attempt_id: int):
        attempt = get_object_or_404(ExamAttempt, pk=attempt_id, user=request.user)
        if attempt.is_submitted:
            return Response({'detail': 'Попытка уже отправлена.'}, status=status.HTTP_409_CONFLICT)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        answers = serializer.validated_data['answers']

        exam = attempt.exam
        questions = list(exam.questions.prefetch_related('choices').all().order_by('order', 'id')[: attempt.max_questions])
        qids = {q.id for q in questions}

        # Проверяем, что ответы относятся к вопросам теста.
        normalized = []
        for a in answers:
            if a['question_id'] in qids:
                normalized.append(a)

        # Подсчёт: один правильный вариант на вопрос.
        correct = 0
        review = []
        with transaction.atomic():
            for q in questions:
                chosen = next((a for a in normalized if a['question_id'] == q.id), None)
                choice_obj = None
                is_correct = False
                if chosen:
                    choice_obj = ExamChoice.objects.filter(id=chosen['choice_id'], question=q).first()
                    if choice_obj and choice_obj.is_correct:
                        is_correct = True
                correct_choice = next((c for c in q.choices.all() if c.is_correct), None)
                ExamAnswer.objects.update_or_create(
                    attempt=attempt,
                    question=q,
                    defaults={'selected_choice': choice_obj, 'is_correct': is_correct},
                )
                if is_correct:
                    correct += 1
                review.append({
                    'question_id': q.id,
                    'selected_choice_id': choice_obj.id if choice_obj else None,
                    'correct_choice_id': correct_choice.id if correct_choice else None,
                    'is_correct': is_correct,
                })

            percent = int(round((correct / max(1, len(questions))) * 100))
            passed = percent >= int(exam.pass_percent or 80)

            attempt.correct_answers = correct
            attempt.score_percent = percent
            attempt.submitted_at = timezone.now()
            attempt.status = ExamAttempt.Status.PASSED if passed else ExamAttempt.Status.FAILED
            attempt.save(update_fields=['correct_answers', 'score_percent', 'submitted_at', 'status'])

            cert_number = None
            if passed:
                cert, _created = CourseCertificate.objects.get_or_create(
                    user=request.user,
                    course=exam.course,
                    defaults={'certificate_number': f'CM-{uuid.uuid4().hex[:12].upper()}'},
                )
                cert_number = cert.certificate_number

        return Response({
            'attempt': {
                'id': attempt.id,
                'status': attempt.status,
                'score_percent': attempt.score_percent,
                'correct_answers': attempt.correct_answers,
                'total_questions': len(questions),
                'pass_percent': exam.pass_percent,
            },
            'certificate_number': cert_number,
            'review': review,
        })


class CourseCertificatePdfView(generics.GenericAPIView):
    """Скачать сертификат в PDF (EN)."""
    permission_classes = (IsAuthenticated,)

    def get(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
        cert = CourseCertificate.objects.filter(course=course, user=request.user).first()
        if not cert:
            return Response({'detail': 'Сертификат не найден.'}, status=status.HTTP_404_NOT_FOUND)

        # PDF: делаем картинку Pillow и сохраняем в PDF (без внешних зависимостей).
        from PIL import Image, ImageDraw, ImageFont

        width, height = 1654, 1169  # примерно A4 landscape при 150dpi
        img = Image.new('RGB', (width, height), color=(248, 250, 252))
        draw = ImageDraw.Draw(img)

        # Пытаемся взять системный шрифт; если нет — Pillow default.
        def load_font(size: int):
            try:
                return ImageFont.truetype('arial.ttf', size)
            except Exception:
                return ImageFont.load_default()

        title_font = load_font(72)
        name_font = load_font(56)
        text_font = load_font(34)
        small_font = load_font(28)

        # Рамка
        margin = 60
        draw.rectangle([margin, margin, width - margin, height - margin], outline=(30, 41, 59), width=6)

        # Заголовки
        draw.text((width // 2, 140), 'CERTIFICATE OF COMPLETION', fill=(15, 23, 42), anchor='mm', font=title_font)
        draw.text((width // 2, 240), 'This certifies that', fill=(55, 65, 81), anchor='mm', font=text_font)

        full_name = (request.user.get_full_name() or request.user.username).strip()
        draw.text((width // 2, 340), full_name, fill=(17, 24, 39), anchor='mm', font=name_font)

        draw.text((width // 2, 430), 'has successfully passed the final exam for', fill=(55, 65, 81), anchor='mm', font=text_font)
        draw.text((width // 2, 505), f'Module: {course.title}', fill=(17, 24, 39), anchor='mm', font=text_font)

        date_str = cert.issued_at.strftime('%Y-%m-%d')
        draw.text((width // 2, 610), f'Date: {date_str}', fill=(55, 65, 81), anchor='mm', font=text_font)

        # Печать (простая)
        seal_center = (width - 260, height - 240)
        seal_r = 120
        draw.ellipse(
            [seal_center[0] - seal_r, seal_center[1] - seal_r, seal_center[0] + seal_r, seal_center[1] + seal_r],
            outline=(220, 38, 38),
            width=10,
        )
        draw.text(seal_center, 'CODEMENTOR\nSEAL', fill=(220, 38, 38), anchor='mm', font=small_font, align='center')

        # Номер сертификата
        draw.text((margin + 10, height - margin - 30), f'Certificate No: {cert.certificate_number}', fill=(55, 65, 81), anchor='ls', font=small_font)

        buf = BytesIO()
        img.save(buf, format='PDF')
        pdf_bytes = buf.getvalue()
        buf.close()

        from django.http import HttpResponse

        filename = f'certificate_course_{course.id}.pdf'
        resp = HttpResponse(pdf_bytes, content_type='application/pdf')
        resp['Content-Disposition'] = f'attachment; filename="{filename}"'
        return resp


class CreateCheckoutSessionView(generics.GenericAPIView):
    """Создание Stripe Checkout Session для оплаты курса. POST → { url: checkout_url }."""
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        import stripe
        from django.conf import settings as django_settings

        secret = getattr(django_settings, 'STRIPE_SECRET_KEY', None)
        if not secret:
            return Response(
                {'detail': 'Оплата не настроена (Stripe).'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        course = get_object_or_404(Course, pk=pk)
        price = course.price
        if price is None or (hasattr(price, '__float__') and float(price) <= 0):
            return Response(
                {'detail': 'Этот курс бесплатный.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        price_float = float(price)
        is_power_bi = 'Power BI' in (course.title or '')
        if is_power_bi:
            currency = 'kzt'
            unit_amount = int(price_float * 100)
        else:
            currency = 'rub'
            unit_amount = int(price_float * 100)
        if unit_amount <= 0:
            return Response(
                {'detail': 'Некорректная цена курса.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        frontend_url = getattr(django_settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
        success_url = f"{frontend_url}/courses/{course.id}?payment=success"
        cancel_url = f"{frontend_url}/courses/{course.id}?payment=cancelled"

        stripe.api_key = secret
        try:
            session = stripe.checkout.Session.create(
                mode='payment',
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': currency,
                        'unit_amount': unit_amount,
                        'product_data': {
                            'name': course.title,
                            'description': (course.description or '')[:500] or course.title,
                        },
                    },
                    'quantity': 1,
                }],
                success_url=success_url,
                cancel_url=cancel_url,
                customer_email=request.user.email or None,
                metadata={'course_id': str(course.id), 'user_id': str(request.user.id)},
            )
            return Response({'url': session.url})
        except Exception as e:
            return Response(
                {'detail': str(e) or 'Ошибка создания сессии оплаты.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )


class TryFreeView(generics.GenericAPIView):
    """Записаться на курс (попробовать бесплатно). POST → курс добавляется в «Моё обучение»."""
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
        enrollment, created = Enrollment.objects.get_or_create(
            user=request.user,
            course=course,
            defaults={'source': Enrollment.Source.FREE_TRIAL},
        )
        return Response(
            {'detail': 'Курс добавлен в «Моё обучение».', 'enrollment_id': enrollment.id},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class CourseCurriculumView(generics.GenericAPIView):
    """Программа курса: модули и уроки (для сайдбара). Без авторизации — только структура."""
    permission_classes = (AllowAny,)
    authentication_classes = ()

    def get(self, request, pk):
        course = get_object_or_404(Course, pk=pk)
        modules = Module.objects.filter(course=course).prefetch_related('lessons')
        serializer = ModuleSerializer(modules, many=True)
        return Response(serializer.data)


class LessonDetailView(generics.RetrieveAPIView):
    """Детали урока (контент). Бесплатные — всем; платные — только записанным на курс."""
    serializer_class = LessonDetailSerializer
    permission_classes = (AllowAny,)

    def get_queryset(self):
        return Lesson.objects.select_related('module', 'module__course')

    def retrieve(self, request, *args, **kwargs):
        lesson = self.get_object()
        if not lesson.is_free:
            if not request.user.is_authenticated:
                return Response(
                    {'detail': 'Войдите и запишитесь на курс для доступа.', 'locked': True},
                    status=status.HTTP_403_FORBIDDEN,
                )
            enrollment = Enrollment.objects.filter(
                user=request.user,
                course=lesson.module.course,
            ).first()
            if not enrollment:
                return Response(
                    {'detail': 'Запишитесь на курс (Попробовать бесплатно) или купите курс.', 'locked': True},
                    status=status.HTTP_403_FORBIDDEN,
                )
            if enrollment.source == Enrollment.Source.FREE_TRIAL:
                return Response(
                    {'detail': 'Этот урок доступен после покупки курса.', 'locked': True},
                    status=status.HTTP_403_FORBIDDEN,
                )
        serializer = self.get_serializer(lesson)
        return Response(serializer.data)


class MyEnrollmentsView(generics.ListAPIView):
    """Мои записи на курсы («Моё обучение»)."""
    serializer_class = EnrollmentSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user).select_related('course')


class MyFavoritesView(generics.GenericAPIView):
    """Избранные курсы: список и добавление."""
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        qs = CourseFavorite.objects.filter(user=request.user).select_related('course')
        course_ids = list(qs.values_list('course_id', flat=True))
        courses_data = CourseSerializer([f.course for f in qs], many=True).data
        return Response({'course_ids': course_ids, 'courses': courses_data})

    def post(self, request):
        course_id = request.data.get('course_id')
        try:
            course_id = int(course_id)
        except (TypeError, ValueError):
            return Response({'detail': 'Нужен course_id (число).'}, status=status.HTTP_400_BAD_REQUEST)
        get_object_or_404(Course, pk=course_id)
        _, created = CourseFavorite.objects.get_or_create(user=request.user, course_id=course_id)
        return Response({'detail': 'Добавлено в избранное.'}, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class FavoriteDeleteView(generics.GenericAPIView):
    """Удалить курс из избранного."""
    permission_classes = (IsAuthenticated,)

    def delete(self, request, course_id):
        CourseFavorite.objects.filter(user=request.user, course_id=course_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class LessonProgressView(generics.GenericAPIView):
    """Прогресс по урокам: словарь course_id -> [lesson_id, ...]."""
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        qs = LessonCompletion.objects.filter(user=request.user).select_related('lesson__module')
        by_course = {}
        for row in qs:
            cid = row.lesson.module.course_id
            by_course.setdefault(str(cid), []).append(row.lesson_id)
        for k in by_course:
            by_course[k] = sorted(set(by_course[k]))
        return Response({'by_course': by_course})

    def post(self, request):
        lesson_id = request.data.get('lesson_id')
        try:
            lesson_id = int(lesson_id)
        except (TypeError, ValueError):
            return Response({'detail': 'Нужен lesson_id (число).'}, status=status.HTTP_400_BAD_REQUEST)
        lesson = get_object_or_404(Lesson, pk=lesson_id)
        _, created = LessonCompletion.objects.get_or_create(user=request.user, lesson=lesson)
        return Response(
            {'detail': 'Урок отмечен пройденным.', 'course_id': lesson.module.course_id},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class LessonProgressSyncView(generics.GenericAPIView):
    """Массовая синхронизация пройденных уроков (объединение с локальными данными)."""
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        by_course = request.data.get('by_course')
        lesson_ids = request.data.get('lesson_ids')
        ids = set()
        if isinstance(by_course, dict):
            for v in by_course.values():
                if isinstance(v, list):
                    for x in v:
                        try:
                            ids.add(int(x))
                        except (TypeError, ValueError):
                            pass
        if isinstance(lesson_ids, list):
            for x in lesson_ids:
                try:
                    ids.add(int(x))
                except (TypeError, ValueError):
                    pass
        if not ids:
            return Response({'detail': 'Передайте by_course или lesson_ids.', 'count': 0})
        valid_ids = set(Lesson.objects.filter(id__in=ids).values_list('id', flat=True))
        for lid in valid_ids:
            LessonCompletion.objects.get_or_create(user=request.user, lesson_id=lid)
        return Response({'detail': 'Синхронизировано.', 'count': len(valid_ids)})


class UserActivityView(generics.GenericAPIView):
    """Активность пользователя: даты записей на курсы за последний год."""
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        from datetime import datetime, timedelta
        from django.utils import timezone
        
        # Получаем дату год назад
        one_year_ago = timezone.now() - timedelta(days=365)
        
        # Получаем все записи на курсы за последний год
        enrollments = Enrollment.objects.filter(
            user=request.user,
            enrolled_at__gte=one_year_ago
        ).values_list('enrolled_at', flat=True)
        
        # Преобразуем даты в строки формата YYYY-MM-DD для удобства на фронтенде
        activity_dates = [
            dt.date().isoformat() if hasattr(dt, 'date') else dt.isoformat()[:10]
            for dt in enrollments
        ]
        
        return Response({'dates': activity_dates})


class LessonCommentsView(generics.ListAPIView):
    """Комментарии к уроку. Доступны всем (публичные)."""
    serializer_class = CommentSerializer
    permission_classes = (AllowAny,)
    authentication_classes = ()

    def get_queryset(self):
        lesson_id = self.kwargs.get('lesson_id')
        return Comment.objects.filter(lesson_id=lesson_id).select_related('user')


class CommentCreateView(generics.CreateAPIView):
    """Создание комментария к уроку. Требует авторизации."""
    serializer_class = CommentCreateSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Comment.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lesson_id = self.kwargs.get('lesson_id')
        lesson = get_object_or_404(Lesson, pk=lesson_id)
        comment = serializer.save(user=self.request.user, lesson=lesson)
        # Возвращаем полный объект с username и created_at
        output_serializer = CommentSerializer(comment)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class CommentUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    """Обновление и удаление комментария. Только автор может редактировать/удалять."""
    serializer_class = CommentSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Comment.objects.select_related('user')

    def get_object(self):
        comment = get_object_or_404(self.get_queryset(), pk=self.kwargs.get('comment_id'))
        # Проверяем, что пользователь является автором
        if comment.user != self.request.user:
            raise PermissionDenied('Вы можете редактировать только свои комментарии.')
        return comment

    def update(self, request, *args, **kwargs):
        comment = self.get_object()
        serializer = CommentCreateSerializer(comment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Возвращаем полный объект
        output_serializer = CommentSerializer(comment)
        return Response(output_serializer.data)

    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class NewsListAPIView(generics.ListAPIView):
    """Список новостей для блока «Что нового»."""
    queryset = NewsItem.objects.all()
    serializer_class = NewsItemSerializer
    permission_classes = (IsAuthenticated,)


# --- OAuth: заглушки и опционально Google ---
FRONTEND_URL = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')


def _social_stub(request, provider):
    """Заглушка: редирект на фронт с сообщением."""
    url = f"{FRONTEND_URL}/login?social={provider}&error=not_configured"
    return HttpResponseRedirect(url)


class GoogleLoginView(View):
    """Редирект на Google OAuth или заглушка."""

    def get(self, request):
        client_id = getattr(settings, 'GOOGLE_OAUTH2_CLIENT_ID', None)
        if not client_id:
            return _social_stub(request, 'google')
        redirect_uri = request.build_absolute_uri('/api/auth/google/callback/')
        scope = 'openid email profile'
        params = {
            'client_id': client_id,
            'redirect_uri': redirect_uri,
            'response_type': 'code',
            'scope': scope,
        }
        url = 'https://accounts.google.com/o/oauth2/v2/auth?' + urllib.parse.urlencode(params)
        return HttpResponseRedirect(url)


class GoogleCallbackView(View):
    """Callback Google OAuth: обмен code на токен, создание/поиск user, редирект на фронт с JWT."""

    def get(self, request):
        code = request.GET.get('code')
        client_id = getattr(settings, 'GOOGLE_OAUTH2_CLIENT_ID', None)
        client_secret = getattr(settings, 'GOOGLE_OAUTH2_CLIENT_SECRET', None)
        if not code or not client_id or not client_secret:
            return HttpResponseRedirect(f"{FRONTEND_URL}/login?error=oauth_failed")
        redirect_uri = request.build_absolute_uri('/api/auth/google/callback/')
        token_body = urllib.parse.urlencode({
            'code': code,
            'client_id': client_id,
            'client_secret': client_secret,
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code',
        }).encode()
        req = urllib.request.Request(
            'https://oauth2.googleapis.com/token',
            data=token_body,
            method='POST',
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                token_data = json.loads(resp.read().decode())
        except Exception:
            return HttpResponseRedirect(f"{FRONTEND_URL}/login?error=oauth_token")
        access_token = token_data.get('access_token')
        if not access_token:
            return HttpResponseRedirect(f"{FRONTEND_URL}/login?error=oauth_token")
        req2 = urllib.request.Request(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            headers={'Authorization': f'Bearer {access_token}'},
        )
        try:
            with urllib.request.urlopen(req2, timeout=10) as resp2:
                user_info = json.loads(resp2.read().decode())
        except Exception:
            return HttpResponseRedirect(f"{FRONTEND_URL}/login?error=oauth_user")
        email = user_info.get('email') or ''
        name = (user_info.get('name') or '').strip() or user_info.get('email', '') or 'user'
        username = (user_info.get('email') or 'google_user').split('@')[0].replace('.', '_')[:30]
        user, created = User.objects.get_or_create(
            username=username,
            defaults={'email': email, 'first_name': name or username}
        )
        if not created and not user.email:
            user.email = email
            user.save(update_fields=['email'])
        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)
        ref = str(refresh)
        return HttpResponseRedirect(
            f"{FRONTEND_URL}/login#access={urllib.parse.quote(access)}&refresh={urllib.parse.quote(ref)}"
        )


class VkLoginStubView(View):
    def get(self, request):
        return _social_stub(request, 'vk')


class GithubLoginStubView(View):
    def get(self, request):
        return _social_stub(request, 'github')


class FacebookLoginStubView(View):
    def get(self, request):
        return _social_stub(request, 'facebook')


class TwitterLoginStubView(View):
    def get(self, request):
        return _social_stub(request, 'twitter')
class YandexLoginStubView(View):
    def get(self, request):
        return _social_stub(request, 'yandex')
