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

public class SingleDateFilter extends DateFilterBase {
    private final LocalDate date;

    public SingleDateFilter(@NotNull LocalDate date) {
        Objects.requireNonNull(date);
        this.date = date;
    }

    @Override
    public DocumentFilterOperations getFilter(CriteriaBuilder cb, Root<Document> root) {
        return new DocumentFilterOperations() {
            @Override
            public Predicate where() {
                return cb.equal(root.get("creationDate"), date);
            }

            @Override
            public Expression<?> groupBy() {
                return null;
            }

            @Override
            public Predicate having() {
                return null;
            }
        };
    }

    @Override
    public int getMatches(Document document) {
        // This is more worth than a range match
        return 2;
    }
}
