package database.filter.filters.dates;

import com.sun.istack.NotNull;
import database.databaseTypes.Document;
import database.filter.DocumentFilterOperations;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Expression;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.time.LocalDate;
import java.util.Objects;

public class DateRangeFilter extends DateFilterBase {
    private final LocalDate begin;
    private final LocalDate end;

    public DateRangeFilter(@NotNull LocalDate begin, @NotNull LocalDate end) {
        Objects.requireNonNull(begin);
        Objects.requireNonNull(end);
        this.begin = begin;
        this.end = end;
    }

    @Override
    public DocumentFilterOperations getFilter(CriteriaBuilder cb, Root<Document> root) {
        return new DocumentFilterOperations() {
            @Override
            public Predicate where() {
                return cb.between(root.get("creationDate"), begin, end);
            }

            @Override
            public Expression<?> groupBy() {
                return null;
            }
        };
    }

    @Override
    public int getMatches(Document document) {
        return 1;
    }
}
