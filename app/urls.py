from django.urls import path

from . import views

urlpatterns = [
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/token/', views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', views.TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', views.CurrentUserView.as_view(), name='current-user'),
    path('auth/password/', views.SetPasswordView.as_view(), name='set-password'),
    # OAuth
    path('auth/google/login/', views.GoogleLoginView.as_view(), name='google-login'),
    path('auth/google/callback/', views.GoogleCallbackView.as_view(), name='google-callback'),
    path('auth/vk/login/', views.VkLoginStubView.as_view(), name='vk-login'),
    path('auth/github/login/', views.GithubLoginStubView.as_view(), name='github-login'),
    path('auth/facebook/login/', views.FacebookLoginStubView.as_view(), name='facebook-login'),
    path('auth/twitter/login/', views.TwitterLoginStubView.as_view(), name='twitter-login'),
    path('auth/yandex/login/', views.YandexLoginStubView.as_view(), name='yandex-login'),
    path('courses/', views.CourseListAPIView.as_view(), name='course-list'),
    path('courses/<int:pk>/', views.CourseDetailAPIView.as_view(), name='course-detail'),
    path('courses/<int:pk>/checkout/', views.CreateCheckoutSessionView.as_view(), name='course-checkout'),
    path('courses/<int:pk>/try-free/', views.TryFreeView.as_view(), name='course-try-free'),
    path('courses/<int:pk>/curriculum/', views.CourseCurriculumView.as_view(), name='course-curriculum'),
    path('courses/<int:pk>/exam/', views.CourseExamInfoView.as_view(), name='course-exam-info'),
    path('courses/<int:pk>/exam/start/', views.CourseExamStartView.as_view(), name='course-exam-start'),
    path('exam-attempts/<int:attempt_id>/submit/', views.ExamAttemptSubmitView.as_view(), name='exam-attempt-submit'),
    path('courses/<int:pk>/certificate/pdf/', views.CourseCertificatePdfView.as_view(), name='course-certificate-pdf'),
    path('lessons/<int:pk>/', views.LessonDetailView.as_view(), name='lesson-detail'),
    path('lessons/<int:lesson_id>/comments/', views.LessonCommentsView.as_view(), name='lesson-comments'),
    path('lessons/<int:lesson_id>/comments/create/', views.CommentCreateView.as_view(), name='comment-create'),
    path('comments/<int:comment_id>/', views.CommentUpdateDeleteView.as_view(), name='comment-update-delete'),
    path('enrollments/', views.MyEnrollmentsView.as_view(), name='my-enrollments'),
    path('favorites/', views.MyFavoritesView.as_view(), name='my-favorites'),
    path('favorites/<int:course_id>/', views.FavoriteDeleteView.as_view(), name='favorite-delete'),
    path('lesson-progress/', views.LessonProgressView.as_view(), name='lesson-progress'),
    path('lesson-progress/sync/', views.LessonProgressSyncView.as_view(), name='lesson-progress-sync'),
    path('activity/', views.UserActivityView.as_view(), name='user-activity'),
    path('news/', views.NewsListAPIView.as_view(), name='news-list'),
]
