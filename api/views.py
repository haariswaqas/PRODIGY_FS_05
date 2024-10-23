from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from api.models import User, Post, Comment, SubComment
from api.serializers import UserSerializer, MyTokenObtainPairSerializer, RegisterSerializer, PostSerializer, RepostSerializer, CommentSerializer, SubCommentSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        # Save the user and handle other custom actions if necessary
        serializer.save()

    def create(self, request, *args, **kwargs):
        # Override the create method to return a custom response
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                "user": serializer.data,
                "message": "User created successfully"
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )

class ProfileListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

class ProfileDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Get the user object by its ID
        user = super().get_object()
        return user  # Allow any authenticated user to view the profile

class ProfileEditView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = super().get_object()
        if user != self.request.user:
            raise PermissionDenied("You do not have permission to edit this profile.")
        return user  # Only allow the owner to edit their own profile
    
    
    
    
    
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import User  # Make sure to import your User model

class FollowUnfollowUserView(APIView):
    permission_classes = [IsAuthenticated]  # Only authenticated users can follow/unfollow

    def post(self, request, username):
        # Retrieve the user object to follow/unfollow or return a 404 error if not found
        user_to_follow = get_object_or_404(User, username=username)

        # Check if the current user is trying to follow themselves
        if request.user == user_to_follow:
            return Response({"error": "You cannot follow yourself."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the current user is already following the specified user
        if request.user.following.filter(id=user_to_follow.id).exists():
            # If the user is already following, remove the following (unfollow)
            request.user.following.remove(user_to_follow)  # Remove the user from following
            is_following = False  # Set the follow status as unfollowed
            message = "You have unfollowed the user."
        else:
            # If the user is not following, add the following
            request.user.following.add(user_to_follow)  # Add the user to following
            is_following = True  # Set the follow status as followed
            message = "You are now following the user."

        return Response({
            "message": message,
            "is_following": is_following,
            "followers_count": user_to_follow.followers.count()  # Return the updated followers count
        }, status=status.HTTP_200_OK)






class FollowUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        user_to_follow = get_object_or_404(User, username=username)
        current_user = request.user

        # Check if the user is trying to follow themselves
        if user_to_follow == current_user:
            return Response({"error": "You cannot follow yourself."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the user is already following the target user
        if current_user.following.filter(id=user_to_follow.id).exists():
            return Response({"error": "You are already following this user."}, status=status.HTTP_400_BAD_REQUEST)

        # Add the following relationship
        current_user.following.add(user_to_follow)
        
        # Optional: Return updated following list or user data
        return Response({"message": f"You are now following {user_to_follow.username}."}, status=status.HTTP_200_OK)

class UnfollowUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        user_to_unfollow = get_object_or_404(User, username=username)
        current_user = request.user

        # Check if the user is trying to unfollow themselves
        if user_to_unfollow == current_user:
            return Response({"error": "You cannot unfollow yourself."}, status=status.HTTP_400_BAD_REQUEST)



class ListFollowersView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_queryset(self):
        user = get_object_or_404(User, username=self.kwargs['username'])
        return user.followers.all()  # List all users who follow this user


class ListFollowingView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_queryset(self):
        user = get_object_or_404(User, username=self.kwargs['username'])
        return user.following.all()  # List all users that this user is following


class PostCreateView(generics.CreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can create posts

    def perform_create(self, serializer):
        # Set the author of the post to the current logged-in user
        serializer.save(author=self.request.user)

class RepostCreateView(generics.CreateAPIView):
    serializer_class = RepostSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        original_post = get_object_or_404(Post, id=self.request.data['post_id'])  # Get the original post
        serializer.save(author=self.request.user, reposted_from=original_post)  # Save the repost with the current user and link to the original post


"""
class RepostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.filter(reposted_from__isnull=False)  # Queryset to get only reposts
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can access

    def get_object(self):
        repost = super().get_object()
        # Allow viewing the repost if it's public or if the current user is the author
        if repost.is_public or (self.request.user.is_authenticated and repost.author == self.request.user):
            return repost
        else:
            raise PermissionDenied("You do not have permission to view this repost.")

    def perform_update(self, serializer):
        repost = self.get_object()
        if repost.author == self.request.user:
            serializer.save()  # Save the updated repost
        else:
            raise PermissionDenied("You do not have permission to edit this repost.")

    def perform_destroy(self, instance):
        if instance.author == self.request.user:
            instance.delete()  # Delete the repost
        else:
            raise PermissionDenied("You do not have permission to delete this repost.")

"""







class PostsListView(generics.ListAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [AllowAny]  # Allow any user to view public posts
    
    def get_queryset(self):
        # Show only public posts or posts by the logged-in user
        if self.request.user.is_authenticated:
            return Post.objects.filter(is_public=True) | Post.objects.filter(author=self.request.user)
        else:
            return Post.objects.filter(is_public=True)
        
        



class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can access

    def get_object(self):
        post = super().get_object()
        # Allow viewing the post if it's public or if the current user is the author
        if post.is_public or (self.request.user.is_authenticated and post.author == self.request.user):
            return post
        else:
            raise PermissionDenied("You do not have permission to view this post.")
    
    def perform_update(self, serializer):
        post = self.get_object()
        if post.author == self.request.user:
            serializer.save()  # Save the updated post
        else:
            raise PermissionDenied("You do not have permission to edit this post.")

    def perform_destroy(self, instance):
        if instance.author == self.request.user:
            instance.delete()  # Delete the post
        else:
            raise PermissionDenied("You do not have permission to delete this post.")


class LikeUnlikePostView(APIView):
    permission_classes = [IsAuthenticated]  # Only authenticated users can like/unlike posts

    def post(self, request, post_id):
        # Retrieve the post object or return a 404 error if not found
        post = get_object_or_404(Post, id=post_id)
        
        # Check if the current user has already liked the post
        if post.likes.filter(id=request.user.id).exists():
            # If the user has liked the post, remove the like (unlike)
            post.likes.remove(request.user)  # Remove the current user from the likes
            return Response({"message": "You have unliked the post."}, status=status.HTTP_200_OK)
        else:
            # If the user has not liked the post, add the like
            post.likes.add(request.user)  # Add the current user to the likes
            return Response({"message": "You have liked the post."}, status=status.HTTP_200_OK)
        
        
class DislikeUndislikePostView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, post_id):
        # Retrieve the post object or return a 404 error if the post is not found
        post = get_object_or_404(Post, id=post_id)
        
        # Check if the current user has already disliked the post
        if post.dislikes.filter(id=request.user.id).exists():
            # If the user has disliked the post, remove the dislike (undislike)
            post.dislikes.remove(request.user)
            return Response({"message": "You have undiliked the post."}, status=status.HTTP_200_OK)
        else:
            # if the user has not disliked the post, add the dislike
            post.dislikes.add(request.user) # add the current user to the dislikes
            return Response({"message": "You have disliked the post."}, status=status.HTTP_200_OK)
            
            
        

class CommentCreateView(generics.CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        post = get_object_or_404(Post, id=self.request.data['post'])  # Get the post
        serializer.save(author=self.request.user, post=post)  # Save the comment with the current user and post

class CommentListView(generics.ListAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        post = get_object_or_404(Post, id=self.kwargs['post_id'])  # Get the post
        return post.comments.all()  # Return all comments for the post
    
    
class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Retrieve the comment object based on the provided ID
        comment = get_object_or_404(Comment, id=self.kwargs['pk'])
        return comment

    def perform_update(self, serializer):
        comment = self.get_object()  # Get the comment object
        # Check if the current user is the author of the comment
        if comment.author == self.request.user:
            serializer.save()  # Save the updated comment
        else:
            raise PermissionDenied("You do not have permission to edit this comment.")

    def perform_destroy(self, instance):
        # Check if the current user is the author of the comment
        # or the author of the post that the comment belongs to
        if instance.author == self.request.user or instance.post.author == self.request.user:
            instance.delete()  # Delete the comment
        else:
            raise PermissionDenied("You do not have permission to delete this comment.")
        

class LikeUnlikeCommentView(APIView):
    permission_classes = [IsAuthenticated]  # Only authenticated users can like/unlike comments

    def post(self, request, comment_id):
        # Retrieve the comment object or return a 404 error if not found
        comment = get_object_or_404(Comment, id=comment_id)
        
        # Check if the current user has already liked the comment
        if comment.likes.filter(id=request.user.id).exists():
            # If the user has liked the comment, remove the like (unlike)
            comment.likes.remove(request.user)  # Remove the current user from the likes
            return Response({"message": "You have unliked the comment."}, status=status.HTTP_200_OK)
        else:
            # If the user has not liked the comment, add the like
            comment.likes.add(request.user)  # Add the current user to the likes
            return Response({"message": "You have liked the comment."}, status=status.HTTP_200_OK)
        
        
class SubCommentCreateView(generics.CreateAPIView):
    serializer_class = SubCommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Get the comment to which this sub-comment is related
        comment = get_object_or_404(Comment, id=self.request.data['comment'])  # Retrieve the comment
        # Save the sub-comment with the current user as the author and link it to the comment
        serializer.save(author=self.request.user, comment=comment)  

class SubCommentListView(generics.ListAPIView):
    serializer_class = SubCommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Get the comment to retrieve sub-comments for
        comment = get_object_or_404(Comment, id=self.kwargs['comment_id'])  # Retrieve the comment
        return comment.sub_comments.all()  # Return all sub-comments related to the comment

class SubCommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SubCommentSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Retrieve the sub-comment object based on the provided ID
        subcomment = get_object_or_404(SubComment, id=self.kwargs['pk'])
        return subcomment

    def perform_update(self, serializer):
        subcomment = self.get_object()  # Get the sub-comment object
        # Check if the current user is the author of the sub-comment
        if subcomment.author == self.request.user:
            serializer.save()  # Save the updated sub-comment
        else:
            raise PermissionDenied("You do not have permission to edit this sub-comment.")

    def perform_destroy(self, instance):
        # Check if the current user is the author of the sub-comment
        # or the author of the comment that the sub-comment belongs to
        if instance.author == self.request.user or instance.comment.author == self.request.user:
            instance.delete()  # Delete the sub-comment
        else:
            raise PermissionDenied("You do not have permission to delete this sub-comment.")
        

class LikeUnlikeSubCommentView(APIView):
    permission_classes = [IsAuthenticated]  # Only authenticated users can like/unlike sub-comments

    def post(self, request, subcomment_id):
        # Retrieve the sub-comment object or return a 404 error if not found
        subcomment = get_object_or_404(SubComment, id=subcomment_id)

        # Check if the current user has already liked the sub-comment
        if subcomment.likes.filter(id=request.user.id).exists():
            # If the user has liked the sub-comment, remove the like (unlike)
            subcomment.likes.remove(request.user)  # Remove the current user from the likes
            return Response({"message": "You have unliked the sub-comment."}, status=status.HTTP_200_OK)
        else:
            # If the user has not liked the sub-comment, add the like
            subcomment.likes.add(request.user)  # Add the current user to the likes
            return Response({"message": "You have liked the sub-comment."}, status=status.HTTP_200_OK)