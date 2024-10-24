from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from api import views

urlpatterns = [
    # JWT Token endpoints
    path("token/", views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path("token/refresh/", TokenRefreshView.as_view(), name='token_refresh'),

    # Registration endpoint
    path("register/", views.RegisterView.as_view(), name='register'),
    path('profiles/', views.ProfileListView.as_view(), name='profile-list'),  # For listing profiles
    path('profiles/<int:pk>/', views.ProfileDetailView.as_view(), name='profile-detail'),  # For viewing a specific profile
    path('profiles/<int:pk>/edit/', views.ProfileEditView.as_view(), name='profile-edit'),  # For editing a specific profile
    
    
    # Following endpoints
    path('follow/<str:username>/', views.FollowUserView.as_view(), name='follow-user'),
    path('unfollow/<str:username>/', views.UnfollowUserView.as_view(), name='unfollow-user'),
    path('<str:username>/followers/', views.ListFollowersView.as_view(), name='list-followers'),
    path('<str:username>/following/', views.ListFollowingView.as_view(), name='list-following'),
    
    path('follow-unfollow/<str:username>/', views.FollowUnfollowUserView.as_view(), name='follow-user'),
    
    # Post endpoints
    path('posts/', views.PostsListView.as_view(), name='posts-list'),  # List public posts and user-specific posts
    path('posts/<int:pk>/', views.PostDetailView.as_view(), name='post-detail'),  # Retrieve, update, or delete a specific post
    path('posts/create/', views.PostCreateView.as_view(), name='post-create'), # Endpoint for creating a new post
    
    path('posts/repost/', views.RepostCreateView.as_view(), name='repost-create'),  # Create a repost
    # path('posts/repost/<int:pk>/', views.RepostDetailView.as_view(), name='repost-detail'),  # Get, update, delete repost

    
    # Like/Unlike Post Endpoint
    path('posts/<int:post_id>/like/', views.LikeUnlikePostView.as_view(), name='like-unlike-post'),
     
    # DisLike/Undislike Post Endpoint
    path('posts/<int:post_id>/dislike/', views.DislikeUndislikePostView.as_view(), name='dislike-undislike-post'),
    
    # Comment Endpoints
    path('posts/<int:post_id>/comments/', views.CommentListView.as_view(), name='comment-list'),
    path('comments/create/', views.CommentCreateView.as_view(), name='comment-create'),
    path('comments/<int:pk>/', views.CommentDetailView.as_view(), name='comment-detail'),
    
    # Like/Unlike Comment Endpoint
    path('comments/<int:comment_id>/like/', views.LikeUnlikeCommentView.as_view(), name='like-unlike-comment'),
    
    
    # SubComment URLs
    path('comments/<int:comment_id>/subcomments/', views.SubCommentCreateView.as_view(), name='subcomment-create'),  # Create a sub-comment
    path('comments/<int:comment_id>/subcomments/list/', views.SubCommentListView.as_view(), name='subcomment-list'),  # List sub-comments for a comment
    path('subcomments/<int:pk>/', views.SubCommentDetailView.as_view(), name='subcomment-detail'),  # Retrieve, update, or delete a sub-comment
    path('subcomments/<int:subcomment_id>/like/', views.LikeUnlikeSubCommentView.as_view(), name='like-unlike-subcomment'),  # Like/unlike a sub-comment

]
