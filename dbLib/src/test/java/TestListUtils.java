import io.github.markusjx.util.ListUtils;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

public class TestListUtils {
    private static final Random rand = new Random();
    private static final int MAX_ARR_LEN = 1000000;

    @SuppressWarnings("all")
    private static final Logger logger = LoggerFactory.getLogger(TestListUtils.class);

    private static List<Integer> getRandomInts() {
        final int numInts = rand.nextInt(MAX_ARR_LEN);
        List<Integer> ints = new ArrayList<>(numInts);
        for (int i = 0; i < numInts; i++) {
            ints.add(rand.nextInt(MAX_ARR_LEN));
        }

        return ints;
    }

    private static List<Integer> getFixedIntegerList(int listSize) {
        List<Integer> ints = new ArrayList<>(listSize);
        for (int i = 0; i < listSize; i++) {
            ints.add(rand.nextInt(listSize));
        }

        return ints;
    }

    @Test
    void removeAllTest() {
        final int NUM_RUNS = 50;
        long sizes = 0;
        for (int i = 0; i < NUM_RUNS; i++) {
            List<Integer> ints = getRandomInts();
            logger.info("List size: " + ints.size());
            sizes += ints.size();
            List<Integer> res = ListUtils.removeAll(ints, ints);

            Assertions.assertEquals(0, res.size());
        }

        logger.info("Average list size: " + (sizes / NUM_RUNS));
    }

    @Test
    void randomRemoveTest() {
        final int NUM_RUNS = 10;
        long listUtils_time = 0;
        long java_time = 0;

        for (int i = 0; i < NUM_RUNS; i++) {
            List<Integer> ints = getFixedIntegerList(10000);
            List<Integer> toRemove = getFixedIntegerList(5000);

            long cur_time = System.currentTimeMillis();
            List<Integer> res = ListUtils.removeAll(ints, toRemove);
            listUtils_time += (System.currentTimeMillis() - cur_time);

            cur_time = System.currentTimeMillis();
            ints.removeAll(toRemove);
            java_time += (System.currentTimeMillis() - cur_time);

            Collections.sort(res);
            Collections.sort(ints);
            Assertions.assertEquals(ints, res);
        }

        logger.info("Custom implementation average run time: " + (listUtils_time / NUM_RUNS) + "ms");
        logger.info("Java implementation average run time: " + (java_time / NUM_RUNS) + "ms");
    }
}
