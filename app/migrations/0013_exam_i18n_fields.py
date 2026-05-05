from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0012_seed_final_exam_example'),
    ]

    operations = [
        migrations.AddField(
            model_name='examquestion',
            name='text_en',
            field=models.TextField(blank=True, default='', verbose_name='Question (en)'),
        ),
        migrations.AddField(
            model_name='examchoice',
            name='text_en',
            field=models.CharField(blank=True, default='', max_length=500, verbose_name='Choice (en)'),
        ),
    ]

