import sys
from os.path import abspath, dirname
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

# Add parent directory to sys.path
sys.path.insert(0, dirname(dirname(abspath(__file__))))

from app.core.config import settings
from app.db.base import Base
import app.models  # Ensures all 20 models are loaded

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata

# Set sqlalchemy.url from application settings if not already provided externally
existing_url = config.get_main_option("sqlalchemy.url")
if not existing_url or "driver://user:pass" in existing_url:
    escaped_url = settings.SQLALCHEMY_DATABASE_URI.replace("%", "%%")
    config.set_main_option("sqlalchemy.url", escaped_url)


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
