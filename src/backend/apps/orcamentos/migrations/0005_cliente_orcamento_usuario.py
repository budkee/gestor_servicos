from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("orcamentos", "0004_cliente_instagram_facebook"),
    ]

    operations = [
        migrations.AddField(
            model_name="cliente",
            name="usuario",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=models.CASCADE,
                related_name="clientes",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="orcamento",
            name="usuario",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=models.CASCADE,
                related_name="orcamentos",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
