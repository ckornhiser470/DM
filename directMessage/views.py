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

# from django.forms import ModelForm
from .models import Messages, Conversations
from .models import Profile
from accounts.models import User
# Create your views here.

# Info for home page and other views

all_users = User.objects.all()
data = serializers.serialize('json', all_users, use_natural_foreign_keys=True)


@login_required
def index(request):

    test = Profile.objects.get(id=request.user.id)
    testt = User.objects.get(id=request.user.id)
    return render(request, "directMessage/index.html", {
        "test": test,
        "testt": testt,
        "profiles": Profile.objects.all()
    })


@ login_required
def profile(request):
    return render(request, "directMessage/profile.html")


@ login_required
def dm(request, user):
    user = User.objects.get(username=user)
    user_id = user.id
    this_convo = Conversations.objects.filter(
        members=request.user.id).filter(members=user_id)
    for conv in this_convo:
        convo = conv
        user_messages = Messages.objects.filter(conversation=convo)
    return render(request, "directMessage/dm.html", {
        # 'to':  User.objects.get(username=user),
        'to': Profile.objects.get(profile=user),
        'conv': user_messages
    })


@ login_required
def user_profile(request, user_id):
    profile_user = Profile.objects.get(profile=user_id)
    if request.method == "GET":
        return JsonResponse(profile_user.serialize(), safe=False)
     # Update profile
    # elif request.method == "PUT":
    #     data = json.loads(request.body)
    #     follower = data.get("followers")
    #     this_follower = User.objects.get(username=follower)

    #     if this_follower in prof_user.followers.all():
    #         prof_user.followers.remove(this_follower)
    #         this_follower.following.remove(prof_user)
    #         prof_user.save()
    #         this_follower.save()
    #     else:
    #         prof_user.followers.add(this_follower)
    #         this_follower.following.add(prof_user)
    #         prof_user.save()
    #         this_follower.save()

    #     return HttpResponse(status=204)

    # Request must be via GET or Put
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)


@ csrf_exempt
@ login_required
def message(request, username):
    if request.method == "GET":
        this_user = User.objects.get(username=username)
        user_id = this_user.id
        if Conversations.objects.filter(members=request.user.id).filter(members=user_id).exists():
            this_convo = Conversations.objects.filter(
                members=request.user.id).filter(members=user_id)
            for conv in this_convo:
                convo = conv
                user_messages = Messages.objects.filter(conversation=convo)
            return JsonResponse([message.serialize() for message in user_messages], safe=False)
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
        return JsonResponse({"message": "Message sent!"}, status=201)
