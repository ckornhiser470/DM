from django.shortcuts import render
from django.urls import reverse
from django.conf import settings

import json
from django.http import JsonResponse
from django.core import serializers

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
# from django.contrib.auth.models import User

from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt

from django.forms import ModelForm
from django import forms
from .models import Messages, Conversations
from .models import Profile
from accounts.models import User
# Create your views here.

# Info for home page and other views

all_users = User.objects.all()
data = serializers.serialize('json', all_users, use_natural_foreign_keys=True)


class ProfileForm(forms.Form):
    image = forms.ImageField()


# HTML Rendering

@login_required
def index(request):
    return render(request, "directMessage/index.html", {
        "current_user": Profile.objects.get(id=request.user.id)
    })


@ login_required
# Returns the friends.html page
def friends(request):
    return render(request, "directMessage/friends.html")


@ login_required
# Returns the profile.html page with the form for updating the profile picture
def profile(request):
    return render(request, "directMessage/profile.html", {
        "form": ProfileForm(),
    })


@login_required
# Returns dm.html already filled with recipient's name
def dm(request, username):
    user = User.objects.get(username=username)
    return render(request, "directMessage/dm.html", {
        'to': Profile.objects.get(profile=user)
    })


# User and Profile Functions
@ login_required
def users(request):
    # Returns list of all users excluding the current user and the admin
    all_users = Profile.objects.all().exclude(
        profile=request.user.id).exclude(profile=7)
    if request.method == "GET":
        return JsonResponse([user.serialize() for user in all_users], safe=False)
    # Request must be via GET
    else:
        return JsonResponse({
            "error": "GET request required."
        }, status=400)


@ login_required
@ csrf_exempt
# put wasn't working with headers using csrf token
def user_profile(request, username):
    user = User.objects.get(username=username)
    prof_user = Profile.objects.get(profile=user)
    if request.method == "GET":
        return JsonResponse(prof_user.serialize(), safe=False)
    #  Update profile
    elif request.method == "PUT":
        data = json.loads(request.body)
        friend = data.get("friendID")
        new_friend = Profile.objects.get(profile=friend)
        new_friend_username = new_friend.profile.username
        status = ""

        if new_friend in prof_user.friends.all():
            prof_user.friends.remove(new_friend)
            new_friend.friends.remove(prof_user)
            prof_user.save()
            new_friend.save()
            Conversations.objects.filter(
                members=request.user.id).filter(members=new_friend.id).delete()
            statusf = "unfriended"

        else:
            prof_user.friends.add(new_friend)
            new_friend.friends.add(prof_user)
            prof_user.save()
            new_friend.save()
            statusf = "friended"

            new_convo = Conversations.objects.create()
            new_convo.members.add(new_friend.id)
            new_convo.members.add(request.user.id)
            new_convo.save()

        return JsonResponse({"username": new_friend_username, "message": statusf}, status=200)

    # Request must be via GET or Put
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)


@login_required
# Saving uploaded profile picture
def profile_pic(request):
    if request.method == "POST":
        form = ProfileForm(request.POST, request.FILES)
        if form.is_valid():
            profile = Profile.objects.get(profile=request.user)
            profile.profile_image = form.cleaned_data['image']
            profile.save()
            return HttpResponseRedirect(reverse("profile"))
        else:
            form = ProfileForm()
        return render(request, "directMessage/profile.html", {
            'form': form,
        })
    else:
        form = ProfileForm()
        return render(request, "directMessage/profile.html", {
            'form': form,
        })


@login_required
def conversations(request, user):
    # Checks if current user is a recipient or sender of a message
    messages = []
    profile = Profile.objects.get(profile=user)
    for message in Messages.objects.filter(recipient=profile):
        messages.append(message)
    for message in Messages.objects.filter(sender=profile):
        messages.append(message)
    if len(messages) == 0:
        return JsonResponse({"message": "No messages"}, safe=False)
    else:
        return JsonResponse({"message": "Has messages!"}, safe=False)


# Messaging Functions

@ login_required
def message(request, username):
    if request.method == "GET":
        this_user = User.objects.get(username=username)
        user_id = this_user.id
        if Conversations.objects.filter(members=request.user.id).filter(members=user_id).exists():
            this_convo = Conversations.objects.filter(
                members=request.user.id).filter(members=user_id)
            for conv in this_convo:
                user_messages = Messages.objects.filter(conversation=conv)
            return JsonResponse([message.serialize() for message in user_messages], safe=False)
            # return JsonResponse({"message": len(this_convo)}, status=201)
        else:
            new_convo = Conversations.objects.create()
            new_convo.members.add(user_id)
            new_convo.members.add(request.user.id)
            new_convo.save()
            convo = new_convo
            return JsonResponse({"message": "Conversation created!"}, status=201)

    if request.method == "POST":
        data = json.loads(request.body)
        recipient = data.get("recipient")
        user = User.objects.get(username=recipient)
        profile = Profile.objects.get(profile=user)
        get_convo = Conversations.objects.filter(
            members=user.id).filter(members=request.user.id)
        for conversation in get_convo:
            convo = conversation
        message = data.get("message")
        new_message = Messages(
            message=message,
            sender=Profile.objects.get(id=request.user.id),
            recipient=profile,
            conversation=convo
        )
        new_message.save()
        return JsonResponse(new_message.serialize(), status=201)
  # Request must be via GET or Put
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)
