# Generated by Django 3.0.3 on 2020-12-27 21:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('directMessage', '0004_auto_20201227_2111'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='profile_image',
            field=models.ImageField(
                blank=True, default='profile/default_img.png', upload_to='profile'),
        ),
    ]
