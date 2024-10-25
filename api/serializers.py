from api.models import User, Post, Comment, SubComment
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    followers = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        required=False
    )
    following = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        required=False
    )
    profile_picture = serializers.ImageField(max_length=None, use_url=True)
    is_following = serializers.SerializerMethodField()  # Add is_following field

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'bio',
            'gender',
            'profile_picture',
            'location',
            'phone_number',
            'website',
            'date_of_birth',
            'age',
            'followers',
            'following',
            'is_following',  # Include is_following in the fields
        ]

    def get_is_following(self, obj):
        # Check if the request is authenticated and if the user is following the serialized user
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.followers.filter(id=request.user.id).exists()  # Check if the user is in the followers list
        return False  # Not following if the user is not authenticated        
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims to the JWT token
        token['username'] = user.username
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['bio'] = user.bio
        token['gender'] = user.gender
        token['profile_picture'] = user.profile_picture.url if user.profile_picture else None
        token['location'] = user.location
        token['phone_number'] = user.phone_number
        token['website'] = user.website
        token['date_of_birth'] = str(user.date_of_birth) if user.date_of_birth else None
        token['age'] = user.age

        # Add followers and following count (optional)
        token['followers_count'] = user.followers.count()
        token['following_count'] = user.following.count()

        return token



class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True
    )

    class Meta:
        model = User
        fields = [
            'email', 'username', 'password', 'password2', 'first_name', 'last_name',
            'bio', 'gender', 'profile_picture', 'location', 'phone_number', 
            'website', 'date_of_birth'
        ]  # Include custom fields in registration

    def validate(self, attrs):
        # Check if the username or email already exists
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"username": "Username is already taken."})
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Email is already in use."})

        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields do not match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            bio=validated_data.get('bio', ''),
            gender=validated_data.get('gender', ''),
            location=validated_data.get('location', ''),
            phone_number=validated_data.get('phone_number', ''),
            website=validated_data.get('website', ''),
            date_of_birth=validated_data.get('date_of_birth', None),
        )
        if 'profile_picture' in validated_data:
            user.profile_picture = validated_data['profile_picture']

        user.set_password(validated_data['password'])
        user.save()

        return user

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'email', 'username', 'first_name', 'last_name',
            'bio', 'gender', 'profile_picture', 'location', 
            'phone_number', 'website', 'date_of_birth'
        ]  # Include fields relevant for profile update

    def update(self, instance, validated_data):
        # Update user fields with validated data
        instance.email = validated_data.get('email', instance.email)
        instance.username = validated_data.get('username', instance.username)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.bio = validated_data.get('bio', instance.bio)
        instance.gender = validated_data.get('gender', instance.gender)
        instance.location = validated_data.get('location', instance.location)
        instance.phone_number = validated_data.get('phone_number', instance.phone_number)
        instance.website = validated_data.get('website', instance.website)
        instance.date_of_birth = validated_data.get('date_of_birth', instance.date_of_birth)
        
        if 'profile_picture' in validated_data:
            instance.profile_picture = validated_data['profile_picture']

        instance.save()
        return instance

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)  # To display the author's username
    

    class Meta:
        model = Post
        fields = ['id', 'author', 'content', 'image', 'created_at', 'updated_at', 'likes', 'dislikes', 'is_public']
        
class RepostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['content', 'image', 'reposted_from']  # Include the reposted_from field if necessary
        read_only_fields = ['author', 'created_at', 'updated_at', 'likes', 'dislikes', 'is_public']  # Make fields read-only

    
from rest_framework import serializers
from .models import Comment
from .serializers import UserSerializer

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    is_liked_by_user = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'content', 'created_at', 'likes', 'is_liked_by_user']
        read_only_fields = ['author', 'created_at']

    def get_is_liked_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()  # Assuming `likes` is a ManyToManyField
        return False

    def create(self, validated_data):
        # If post is passed in, it should be handled here
        return super().create(validated_data)

class SubCommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = SubComment
        fields = ['id', 'comment', 'author', 'content', 'created_at', 'likes']
        read_only_fields = ['author', 'created_at']  # Author and created_at should be read-only