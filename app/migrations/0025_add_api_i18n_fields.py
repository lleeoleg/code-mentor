from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0024_fix_python_functions_video_url'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='description_en',
            field=models.TextField(blank=True, default='', verbose_name='Description (EN)'),
        ),
        migrations.AddField(
            model_name='course',
            name='title_en',
            field=models.CharField(blank=True, default='', max_length=255, verbose_name='Title (EN)'),
        ),
        migrations.AddField(
            model_name='lesson',
            name='content_en',
            field=models.TextField(blank=True, default='', verbose_name='Content (EN)'),
        ),
        migrations.AddField(
            model_name='lesson',
            name='title_en',
            field=models.CharField(blank=True, default='', max_length=255, verbose_name='Title (EN)'),
        ),
        migrations.AddField(
            model_name='module',
            name='title_en',
            field=models.CharField(blank=True, default='', max_length=255, verbose_name='Title (EN)'),
        ),
        migrations.AddField(
            model_name='newsitem',
            name='content_en',
            field=models.TextField(blank=True, default='', verbose_name='Text (EN, HTML)'),
        ),
    ]
