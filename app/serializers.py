from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Course, NewsItem, Module, Lesson, Enrollment, Comment


class UserMeSerializer(serializers.ModelSerializer):
    """Текущий пользователь: id, username, email, is_superuser."""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'is_superuser')
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
    level_display = serializers.CharField(source='get_level_display', read_only=True)

    class Meta:
        model = Course
        fields = ('id', 'title', 'description', 'level', 'level_display', 'price', 'created_at', 'updated_at')


class NewsItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsItem
        fields = ('id', 'published_at', 'content')


class LessonListSerializer(serializers.ModelSerializer):
    """Урок в списке (для сайдбара): id, title, order, is_free."""
    class Meta:
        model = Lesson
        fields = ('id', 'title', 'order', 'is_free')


class LessonDetailSerializer(serializers.ModelSerializer):
    """Урок для просмотра: полный контент."""
    class Meta:
        model = Lesson
        fields = ('id', 'title', 'order', 'content_type', 'content', 'is_free')


class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonListSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ('id', 'title', 'order', 'lessons')


class EnrollmentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Enrollment
        fields = ('id', 'course', 'course_title', 'enrolled_at', 'source')


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
