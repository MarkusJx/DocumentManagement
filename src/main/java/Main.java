import database.DatabaseManager;
import database.filter.DocumentFilter;
import database.filter.filters.FilenameFilter;
import database.filter.filters.PropertyFilter;
import database.filter.filters.TagFilter;
import database.filter.filters.dates.DateFilter;
import datatypes.DocumentSearchResult;
import io.quarkus.runtime.QuarkusApplication;
import io.quarkus.runtime.annotations.QuarkusMain;

import javax.inject.Inject;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@QuarkusMain
public class Main implements QuarkusApplication {
    /*public static void main(String[] args) {
        test();
    }*/

    @Inject
    DatabaseManager manager;

    public void test() {
        manager.createTag("abc");
        manager.createTag("def");

        manager.createProperty("prop1");
        manager.createProperty("prop2");

        Map<String, String> m = new HashMap<>();
        m.put("prop1", "val1");
        m.put("prop2", "val1");

        manager.createDocument("n1", "C/n1",
                m, LocalDate.now(), "abc", "def");

        DocumentSearchResult docs = manager.getDocumentBy(DocumentFilter.createFilter(
                new TagFilter("abc", "def"),
                new FilenameFilter("1", false),
                new PropertyFilter("prop1", "val2", "prop2", "val1"),
                //new SingleDateFilter(LocalDate.of(2000, 10, 10))
                //DateFilter.today()
                DateFilter.getByDate(2021, 2)
        ));
        System.out.println(docs);
        System.out.println(docs.size());

        //manager.close();
    }

    @Override
    public int run(String... args) throws Exception {
        test();
        return 0;
    }
}
