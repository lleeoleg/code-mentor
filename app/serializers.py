from django.contrib.auth.models import User
from rest_framework import serializers

from .i18n_api import get_api_lang
from .models import (
    Course,
    NewsItem,
    Module,
    Lesson,
    Enrollment,
    Comment,
    CourseExam,
    ExamQuestion,
    ExamChoice,
    ExamAttempt,
)


class UserMeSerializer(serializers.ModelSerializer):
    """Текущий пользователь: профиль и контакты (имя/фамилия — для сертификата и отображения)."""

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_superuser')
        read_only_fields = ('id', 'username', 'is_superuser')


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'email')
        extra_kwargs = {'email': {'required': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', ''),
        )
        return user


class CourseSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    level_display = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ('id', 'title', 'description', 'level', 'level_display', 'price', 'created_at', 'updated_at')

    def get_title(self, obj):
        if get_api_lang(self.context.get('request')) == 'en':
            return (obj.title_en or '').strip() or obj.title
        return obj.title

    def get_description(self, obj):
        if get_api_lang(self.context.get('request')) == 'en':
            return (obj.description_en or '').strip() or obj.description
        return obj.description

    def get_level_display(self, obj):
        if get_api_lang(self.context.get('request')) == 'en':
            return {
                'beginner': 'Beginner',
                'intermediate': 'Intermediate',
                'advanced': 'Advanced',
                'all': 'Any level',
            }.get(obj.level, obj.level)
        return obj.get_level_display()


class NewsItemSerializer(serializers.ModelSerializer):
    content = serializers.SerializerMethodField()

    class Meta:
        model = NewsItem
        fields = ('id', 'published_at', 'content')

    def get_content(self, obj):
        if get_api_lang(self.context.get('request')) == 'en':
            return (obj.content_en or '').strip() or obj.content
        return obj.content


class LessonListSerializer(serializers.ModelSerializer):
    """Урок в списке (для сайдбара): id, title, order, is_free."""
    title = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ('id', 'title', 'order', 'is_free')

    def get_title(self, obj):
        if get_api_lang(self.context.get('request')) == 'en':
            return (obj.title_en or '').strip() or obj.title
        return obj.title


class LessonDetailSerializer(serializers.ModelSerializer):
    """Урок для просмотра: полный контент."""
    title = serializers.SerializerMethodField()
    content = serializers.SerializerMethodField()
    video_summary = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ('id', 'title', 'order', 'content_type', 'content', 'video_summary', 'is_free')

    def get_title(self, obj):
        if get_api_lang(self.context.get('request')) == 'en':
            return (obj.title_en or '').strip() or obj.title
        return obj.title

    def get_content(self, obj):
        if get_api_lang(self.context.get('request')) == 'en':
            return (obj.content_en or '').strip() or obj.content
        return obj.content

    def get_video_summary(self, obj):
        if obj.content_type != 'video':
            return ''
        if get_api_lang(self.context.get('request')) == 'en':
            return (obj.video_summary_en or '').strip() or (obj.video_summary or '').strip()
        return (obj.video_summary or '').strip() or (obj.video_summary_en or '').strip()


class ModuleSerializer(serializers.ModelSerializer):
    title = serializers.SerializerMethodField()
    lessons = LessonListSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ('id', 'title', 'order', 'lessons')

    def get_title(self, obj):
        if get_api_lang(self.context.get('request')) == 'en':
            return (obj.title_en or '').strip() or obj.title
        return obj.title


class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = ('id', 'course', 'course_title', 'enrolled_at', 'source')

    def get_course_title(self, obj):
        c = obj.course
        if get_api_lang(self.context.get('request')) == 'en':
            return (c.title_en or '').strip() or c.title
        return c.title


class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'user_id', 'username', 'text', 'created_at')
        read_only_fields = ('id', 'user_id', 'username', 'created_at')


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ('text',)


class ExamChoicePublicSerializer(serializers.ModelSerializer):
    text = serializers.SerializerMethodField()

    class Meta:
        model = ExamChoice
        fields = ('id', 'text')

    def get_text(self, obj):
        if get_api_lang(self.context.get('request')) == 'en':
            return obj.text_en or obj.text
        return obj.text or obj.text_en


class ExamQuestionPublicSerializer(serializers.ModelSerializer):
    text = serializers.SerializerMethodField()
    choices = ExamChoicePublicSerializer(many=True, read_only=True)

    class Meta:
        model = ExamQuestion
        fields = ('id', 'text', 'order', 'choices')

    def get_text(self, obj):
        if get_api_lang(self.context.get('request')) == 'en':
            return obj.text_en or obj.text
        return obj.text or obj.text_en


class CourseExamInfoSerializer(serializers.ModelSerializer):
    course_id = serializers.IntegerField(source='course.id', read_only=True)
    course_title = serializers.SerializerMethodField()

    class Meta:
        model = CourseExam
        fields = ('id', 'course_id', 'course_title', 'is_active', 'pass_percent', 'questions_count')

    def get_course_title(self, obj):
        c = obj.course
        if get_api_lang(self.context.get('request')) == 'en':
            return (c.title_en or '').strip() or c.title
        return c.title


class ExamStartSerializer(serializers.ModelSerializer):
    questions = ExamQuestionPublicSerializer(many=True, read_only=True)

    class Meta:
        model = ExamAttempt
        fields = ('id', 'status', 'started_at', 'questions')


class ExamSubmitSerializer(serializers.Serializer):
    answers = serializers.ListField(
        child=serializers.DictField(),
        allow_empty=False,
    )

    def validate_answers(self, value):
        cleaned = []
        for item in value:
            qid = item.get('question_id')
            cid = item.get('choice_id')
            if qid is None or cid is None:
                raise serializers.ValidationError('Каждый ответ должен содержать question_id и choice_id.')
            try:
                qid = int(qid)
                cid = int(cid)
            except (TypeError, ValueError):
                raise serializers.ValidationError('question_id и choice_id должны быть числами.')
            cleaned.append({'question_id': qid, 'choice_id': cid})
        return cleaned


class AIChatMessageSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=('user', 'assistant'))
    content = serializers.CharField(max_length=8000)


class AIChatSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=4000, trim_whitespace=True)
    history = AIChatMessageSerializer(many=True, required=False, max_length=20)

    def validate_message(self, value):
        if not value.strip():
            raise serializers.ValidationError('Сообщение не может быть пустым.')
        return value.strip()
