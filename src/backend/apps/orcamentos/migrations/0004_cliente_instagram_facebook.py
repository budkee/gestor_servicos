from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("orcamentos", "0003_orcamento_desconto_percentual_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="cliente",
            name="instagram",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="cliente",
            name="facebook",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
    ]
