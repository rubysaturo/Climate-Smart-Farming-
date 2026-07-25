from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_customuser_supabase_uid'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='supabase_uid',
            field=models.UUIDField(blank=True, null=True, unique=True, verbose_name='Supabase Auth UID'),
        ),
    ]
