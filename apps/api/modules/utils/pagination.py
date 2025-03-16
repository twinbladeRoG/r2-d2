from math import ceil

from pydantic import BaseModel, Field

from api.models import Pagination


def get_pagination(page: int, limit: int, count: int) -> Pagination:
    total_pages = ceil(count / limit)

    pagination = Pagination(
        page=page,
        limit=limit,
        total_count=count,
        total_pages=total_pages,
        has_next=True if page != total_pages - 1 and page < total_pages - 1 else False,
        has_previous=True if page != 0 and page <= total_pages - 1 else False,
    )

    return pagination


class PaginationQueryParams(BaseModel):
    page: int = Field(0, gte=0)
    limit: int = Field(10, gte=1, le=100)


class PaginationOutOfBoundException(Exception):
    def __init__(self, page: int, count: int, *args):
        super().__init__(*args)
        self.page = page
        self.count = count

    def __str__(self):
        return f"You don't have any page for index {self.page}. Maximum page size is {self.count}"
