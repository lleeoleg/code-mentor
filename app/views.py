import json
import urllib.parse
import urllib.request
from django.conf import settings
from django.contrib.auth.models import User
from django.db.models import Q
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.views import View
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Course, NewsItem, Module, Lesson, Enrollment, Comment
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
)


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
        amount_kopecks = int(float(price) * 100)
        if amount_kopecks <= 0:
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
                        'currency': 'rub',
                        'unit_amount': amount_kopecks,
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
