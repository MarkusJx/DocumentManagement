package database.filter.filters.dates;

import database.databaseTypes.Document;
import database.filter.DocumentFilterBase;
import database.filter.DocumentFilterOperations;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Root;
import java.time.LocalDate;
import java.time.Year;
import java.time.YearMonth;
import java.util.Objects;

public class DateFilter implements DocumentFilterBase {
    private final DateFilterBase filter;

    private DateFilter(DateFilterBase filter) {
        Objects.requireNonNull(filter);
        this.filter = filter;
    }

    public static DateFilter getByDate(LocalDate begin) {
        Objects.requireNonNull(begin);
        return new DateFilter(new SingleDateFilter(begin));
    }

    public static DateFilter getByDate(LocalDate begin, LocalDate end) {
        Objects.requireNonNull(begin);
        Objects.requireNonNull(end);
        return new DateFilter(new DateRangeFilter(begin, end));
    }

    public static DateFilter getByDate(int year) {
        LocalDate begin = Year.of(year).atDay(1);
        LocalDate end = Year.of(year).atMonth(12).atEndOfMonth();

        return new DateFilter(new DateRangeFilter(begin, end));
    }

    public static DateFilter getByDate(int year, int month) {
        LocalDate begin = YearMonth.of(year, month).atDay(1);
        LocalDate end = YearMonth.of(year, month).atEndOfMonth();

        return new DateFilter(new DateRangeFilter(begin, end));
    }

    public static DateFilter getByDate(int year, int month, int day) {
        return new DateFilter(new SingleDateFilter(LocalDate.of(year, month, day)));
    }

    public static DateFilter today() {
        return new DateFilter(new SingleDateFilter(LocalDate.now()));
    }

    @Override
    public DocumentFilterOperations getFilter(CriteriaBuilder cb, Root<Document> root) {
        return filter.getFilter(cb, root);
    }

    @Override
    public int getMatches(Document document) {
        return filter.getMatches(document);
    }
}
