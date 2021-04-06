package io.github.markusjx.database.filter.filters.dates;

import io.github.markusjx.database.filter.DocumentFilterBase;
import io.github.markusjx.database.filter.DocumentFilterOperations;
import io.github.markusjx.database.types.Document;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Root;
import java.time.LocalDate;
import java.time.Year;
import java.time.YearMonth;
import java.util.Objects;

/**
 * A filter to filter documents by dates
 */
public class DateFilter implements DocumentFilterBase {
    /**
     * The actual filter implementation
     */
    private final DateFilterBase filterImpl;

    /**
     * Create a new DateFilter with an implementation
     *
     * @param filter the filter implementation
     */
    private DateFilter(DateFilterBase filter) {
        Objects.requireNonNull(filter);
        this.filterImpl = filter;
    }

    /**
     * Get a single date filter by a date
     *
     * @param date the date to filter by
     * @return the DateFilter instance
     */
    public static DateFilter getByDate(LocalDate date) {
        Objects.requireNonNull(date);
        return new DateFilter(new SingleDateFilter(date));
    }

    /**
     * Get a date range filter by a date range
     *
     * @param begin the begin date
     * @param end   the end date
     * @return the DateFilter instance
     */
    public static DateFilter getByDate(LocalDate begin, LocalDate end) {
        Objects.requireNonNull(begin);
        Objects.requireNonNull(end);
        return new DateFilter(new DateRangeFilter(begin, end));
    }

    /**
     * Get a date range filter by a year.
     * Filters all documents created in a single year.
     *
     * @param year the year to filter by
     * @return the date filter instance
     */
    public static DateFilter getByDate(int year) {
        LocalDate begin = Year.of(year).atDay(1);
        LocalDate end = Year.of(year).atMonth(12).atEndOfMonth();

        return new DateFilter(new DateRangeFilter(begin, end));
    }

    /**
     * Get a date range filter by a year and month.
     * Filters all documents created in a single month in a single year.
     *
     * @param year  the year to filter by
     * @param month the month to filter by
     * @return the date filter instance
     */
    public static DateFilter getByDate(int year, int month) {
        LocalDate begin = YearMonth.of(year, month).atDay(1);
        LocalDate end = YearMonth.of(year, month).atEndOfMonth();

        return new DateFilter(new DateRangeFilter(begin, end));
    }

    /**
     * Get a single date filter by a year, month and date.
     * Filters all documents created on a specific date.
     *
     * @param year  the year to filter by
     * @param month the month to filter by
     * @param day   the day to filter by
     * @return the date filter instance
     */
    public static DateFilter getByDate(int year, int month, int day) {
        return new DateFilter(new SingleDateFilter(LocalDate.of(year, month, day)));
    }

    /**
     * Get a date filter of today.
     * Filters all documents that were created today.
     *
     * @return the date filter instance
     */
    public static DateFilter today() {
        return new DateFilter(new SingleDateFilter(LocalDate.now()));
    }

    /**
     * Get the filter of the filter implementation
     *
     * @param cb   the criteria builder object
     * @param root the root object
     * @return the filter operations
     */
    @Override
    public DocumentFilterOperations getFilter(CriteriaBuilder cb, Root<Document> root) {
        return filterImpl.getFilter(cb, root);
    }

    /**
     * Get the accuracy of the filter implementation
     *
     * @param document the document object to match
     * @return the accuracy
     */
    @Override
    public int getAccuracy(Document document) {
        return filterImpl.getAccuracy(document);
    }
}
