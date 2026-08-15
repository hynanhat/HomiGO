package com.batdongsan.dto;

import org.springframework.data.domain.Page;

import java.util.List;

public class PageResponse<T> {
    private final List<T> content;
    private final int number;
    private final int size;
    private final long totalElements;
    private final int totalPages;
    private final int numberOfElements;
    private final boolean first;
    private final boolean last;
    private final boolean empty;

    private PageResponse(Page<T> page) {
        content = page.getContent();
        number = page.getNumber();
        size = page.getSize();
        totalElements = page.getTotalElements();
        totalPages = page.getTotalPages();
        numberOfElements = page.getNumberOfElements();
        first = page.isFirst();
        last = page.isLast();
        empty = page.isEmpty();
    }

    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(page);
    }

    public List<T> getContent() { return content; }
    public int getNumber() { return number; }
    public int getSize() { return size; }
    public long getTotalElements() { return totalElements; }
    public int getTotalPages() { return totalPages; }
    public int getNumberOfElements() { return numberOfElements; }
    public boolean isFirst() { return first; }
    public boolean isLast() { return last; }
    public boolean isEmpty() { return empty; }
}
