from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("profile", views.profile, name="profile"),
    path("dm/<str:user>", views.dm, name="dm"),


    # API Routes

    path("user/<int:user_id>", views.user_profile, name="user_profile"),
    path("message/<str:username>", views.message, name="message"),

]
