package database.filter;

import database.databaseTypes.Document;

import javax.persistence.criteria.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class DocumentFilter {
    private final List<DocumentFilterBase> filters;

    public DocumentFilter() {
        this.filters = new ArrayList<>();
    }

    public static DocumentFilter createFilter(DocumentFilterBase... filter) {
        return new DocumentFilter().addFilter(filter);
    }

    public DocumentFilter addFilter(DocumentFilterBase... filter) {
        if (filter.length == 1) {
            filters.add(filter[0]);
        } else if (filter.length > 1) {
            filters.addAll(Arrays.asList(filter));
        }

        return this;
    }

    public List<DocumentFilterBase> getFilters() {
        return filters;
    }

    public CriteriaQuery<Document> getFilterRequest(CriteriaBuilder cb) {
        CriteriaQuery<Document> query = cb.createQuery(Document.class);
        Root<Document> root = query.from(Document.class);
        query.select(root);
        query.distinct(true);

        List<Predicate> where = new ArrayList<>();
        List<Expression<?>> groupBy = new ArrayList<>();
        List<Predicate> having = new ArrayList<>();
        for (DocumentFilterBase fb : filters) {
            DocumentFilterOperations f = fb.getFilter(cb, root);
            Predicate w = f.where();
            Expression<?> g = f.groupBy();
            Predicate h = f.having();

            if (w != null) where.add(w);
            if (g != null) groupBy.add(g);
            if (h != null) having.add(h);
        }

        if (!where.isEmpty())
            query.where(where.toArray(new Predicate[0]));
        if (!groupBy.isEmpty())
            query.groupBy(groupBy);
        if (!having.isEmpty())
            query.having(having.toArray(new Predicate[0]));

        return query;
    }
}
