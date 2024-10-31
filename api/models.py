from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import date
from django.conf import settings


class User(AbstractUser): 
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)
    bio = models.TextField(max_length=500, blank=True)  # Optional user bio
    gender = models.CharField(max_length=10, null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)  # Profile image
    location = models.CharField(max_length=100, blank=True)  # User's location (optional)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    website = models.URLField(blank=True, null=True)  # Optional personal website
    date_of_birth = models.DateField(blank=True, null=True)  # Optional DOB field
    age = models.IntegerField(null=True, blank=True)
    
    followers = models.ManyToManyField('self', symmetrical=False, related_name='following', blank=True)  # ManyToMany relationship for followers and following
 
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name']
    
    def __str__(self):
        followers_count = self.followers.count()  # Number of users following this user
        following_count = self.following.count()  # Number of users this user is following
        return f'{self.first_name} ({self.username}): {followers_count} followers, {following_count} following'


    # Override the save method to calculate age based on date_of_birth
    def save(self, *args, **kwargs):
        if self.date_of_birth:
            today = date.today()
            self.age = today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        super().save(*args, **kwargs)



class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')  # User who created the post
    content = models.TextField(max_length=1000, blank=True, null=True)  # Post text content (optional)
    image = models.ImageField(upload_to='post_images/', blank=True, null=True)  # Optional image for the post
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp for when the post is created
    updated_at = models.DateTimeField(auto_now=True)  # Timestamp for when the post is last updated
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)  # Users who liked the post
    dislikes = models.ManyToManyField(User, related_name='unliked_post', blank=True)
    is_public = models.BooleanField(default=True)  # Visibility flag (public or private post)
    reposted_from = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='reposts')  # Link to the original post
    reposted_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='reposted_posts')

    # Repost related fields
   
    
    

    @property
    def like_count(self):
        return self.likes.count()  # Count the number of likes
    
    @property
    def dislike_count(self):
        return self.dislikes.count()  # Count the number of dislikes


       
    def __str__(self):
        liked_by = ', '.join([user.username for user in self.likes.all()[:3]])  # Show the first 3 usernames
        return f'Post by {self.author.username} on {self.created_at} liked by {liked_by}'

    class Meta:
        ordering = ['-created_at']  # Order by newest post first


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')  # The post to which this comment belongs
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')  # User who created the comment
    content = models.TextField(max_length=500)  # The content of the comment
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp for when the comment is created
    likes = models.ManyToManyField(User, related_name='liked_comments', blank=True)  # Users who liked the comment

    @property
    def like_count(self):
        return self.likes.count()  # Count the number of likes on the comment

    def __str__(self):
        return f'Comment by {self.author.username}'  # Assuming Post has a title field

    class Meta:
        ordering = ['-created_at']  # Order by newest comment first
        
class SubComment(models.Model):
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='sub_comments')  # Link to the parent comment
    author = models.ForeignKey(User, on_delete=models.CASCADE)  # Author of the sub-comment
    content = models.TextField(max_length=1000)  # Content of the sub-comment
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp for when the sub-comment is created
    updated_at = models.DateTimeField(auto_now=True)  # Timestamp for when the sub-comment is last updated
    likes = models.ManyToManyField(User, related_name='liked_sub_comments', blank=True)  # Users who liked the sub-comment

    @property
    def like_count(self):
        return self.likes.count()  # Count the number of likes on the comment

    def __str__(self):
        return f'Comment by {self.author.username}'  # Assuming Post has a title field

    class Meta:
        ordering = ['-created_at']  # Order by newest comment first

    def __str__(self):
        return f'SubComment by {self.author.username} on comment {self.comment.id}'