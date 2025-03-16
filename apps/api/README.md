# R2-D2 FastAPI Backend

# Getting Started

## Installation

### Install [UV](https://docs.astral.sh/uv/) - Rust based python package manager

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Create Virtual Environment for Python using UV

```bash
uv venv
source .venv/bin/activate
```

### Install dependencies

```bash
uv sync
```

## Dependencies

| Package | Description |
| ------- | ----------- |
| [Alembic](https://alembic.sqlalchemy.org/en/latest/) | Database Migration |

## Managing Migrations using Alembic

To create new migration

```bash
PYTHONPATH=".." alembic revision --autogenerate -m "add user table"
```

To run your migrations

```bash
PYTHONPATH=".." alembic upgrade head
```

To check migration history

```bash
PYTHONPATH=".." alembic history --verbose
```

To downgrade to beginning

```bash
PYTHONPATH=".." alembic downgrade base
```