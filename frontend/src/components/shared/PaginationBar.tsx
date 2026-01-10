"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/src/components/ui/pagination";

interface Props {
  currentPage: number;
  totalPage: number;
}

export default function PaginationBar({ currentPage, totalPage }: Props) {
  const pages: (number | "ellipsis")[] = [];

  const pushPage = (p: number) => pages.push(p);
  const pushEllipsis = () => pages.push("ellipsis");

  pushPage(1);

  if (currentPage > 4) {
    pushEllipsis();
  }

  for (let i = currentPage - 1; i <= currentPage + 1; i++) {
    if (i > 1 && i < totalPage) {
      pushPage(i);
    }
  }

  if (currentPage < totalPage - 3) {
    pushEllipsis();
  }

  if (totalPage > 1) {
    pushPage(totalPage);
  }

  return (
    <Pagination>
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious href={`?pageNumber=${currentPage - 1}`} />
          </PaginationItem>
        )}

        {pages.map((p, index) => {
          if (p === "ellipsis") {
            return (
              <PaginationItem key={`e-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={p}>
              <PaginationLink
                href={`?pageNumber=${p}`}
                isActive={p === currentPage}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {currentPage < totalPage && (
          <PaginationItem>
            <PaginationNext href={`?pageNumber=${currentPage + 1}`} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
