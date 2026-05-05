from django.db import migrations


def backfill(apps, schema_editor):
    ExamQuestion = apps.get_model('app', 'ExamQuestion')
    ExamChoice = apps.get_model('app', 'ExamChoice')

    for q in ExamQuestion.objects.all():
        if not (q.text_en or '').strip():
            q.text_en = q.text
            q.save(update_fields=['text_en'])

    for c in ExamChoice.objects.all():
        if not (c.text_en or '').strip():
            c.text_en = c.text
            c.save(update_fields=['text_en'])


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0013_exam_i18n_fields'),
    ]

    operations = [
        migrations.RunPython(backfill, reverse_code=migrations.RunPython.noop),
    ]

