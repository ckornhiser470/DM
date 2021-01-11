from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("friends", views.friends, name="friends"),
    path("profile", views.profile, name="profile"),
    path("dm/<str:username>", views.dm, name="dm"),
    path("profile_pic", views.profile_pic, name="profile_pic"),
    path("conversations/<int:user>",
         views.conversations, name="conversations"),

    # API Routes

    path("user/<str:username>", views.user_profile, name="user_profile"),
    path("message/<str:username>", views.message, name="message"),
    path("users", views.users, name="users")
]
