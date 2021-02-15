package database.filter.filters;

import database.databaseTypes.Document;
import database.databaseTypes.Tag;
import database.filter.DocumentFilterBase;
import database.filter.DocumentFilterOperations;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Join;
import javax.persistence.criteria.JoinType;
import javax.persistence.criteria.Root;
import java.util.ArrayList;
import java.util.List;

public class TagFilter implements DocumentFilterBase {
    private final List<Tag> tags;

    public TagFilter(String... tags) {
        this.tags = new ArrayList<>();
        for (String t : tags) {
            this.tags.add(new Tag(t));
        }
    }

    @Override
    public DocumentFilterOperations getFilter(CriteriaBuilder cb, Root<Document> root) {
        Join<Document, List<Tag>> join = root.join("tags", JoinType.LEFT);
        return new ListJoinFilter<>(join, cb, tags);
    }

    @Override
    public int getMatches(Document document) {
        int res = 0;
        for (Tag t : document.getTags()) {
            if (tagsContains(t)) res++;
        }
        return res;
    }

    private boolean tagsContains(Tag tag) {
        for (Tag t : tags) {
            if (t.equals(tag)) return true;
        }
        return false;
    }
}
