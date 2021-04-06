import io.github.markusjx.database.types.Tag;
import io.github.markusjx.util.ListUtils;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.function.Function;
import java.util.stream.Collectors;

class TestListUtils {
    private static final Random rand = new Random();
    private static final int MAX_ARR_LEN = 1000000;

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

    private static List<Tag> generateRandomTags(int numTags) {
        List<Tag> tags = new ArrayList<>(numTags);
        for (int i = 0; i < numTags; i++) {
            tags.add(new Tag("t" + rand.nextInt(numTags)));
        }

        return tags;
    }

    private static <T extends Comparable<? super T>> void testBase(String testName, final int NUM_RUNS, final int NUM_INTEGERS,
                                                                   Function<Integer, List<T>> valGenerator,
                                                                   Function<Integer, List<T>> toRemoveGenerator,
                                                                   boolean distinct, boolean alterLists) {
        final Logger logger = LoggerFactory.getLogger(testName);
        long listUtils_time = 0;
        long java_time = 0;

        logger.info("Running with fixed list size: " + NUM_INTEGERS);

        for (int i = 0; i < NUM_RUNS; i++) {
            List<T> vals = valGenerator.apply(NUM_INTEGERS);
            List<T> toRemove = toRemoveGenerator.apply(NUM_INTEGERS / 2);

            long cur_time = System.currentTimeMillis();
            List<T> res = ListUtils.removeAll(new ArrayList<>(vals), toRemove, distinct, alterLists);
            listUtils_time += System.currentTimeMillis() - cur_time;
            logger.info("Run " + (i + 0.5) + "/" + NUM_RUNS + " finished");

            cur_time = System.currentTimeMillis();
            vals.removeAll(toRemove);
            if (distinct) {
                vals = vals.stream().distinct().sorted().collect(Collectors.toList());
            }
            java_time += System.currentTimeMillis() - cur_time;
            logger.info("Run " + (i + 1) + "/" + NUM_RUNS + " finished");

            Collections.sort(vals);
            Assertions.assertEquals(vals, res, toRemove.toString());
        }

        logger.info("Custom implementation average run time: " + (listUtils_time / NUM_RUNS) + "ms");
        logger.info("Java implementation average run time: " + (java_time / NUM_RUNS) + "ms");
    }

    @Test
    void removeAllTest() {
        final Logger logger = LoggerFactory.getLogger("removeAllTest");
        final int NUM_RUNS = 50;
        long sizes = 0;
        long time = 0;

        for (int i = 0; i < NUM_RUNS; i++) {
            List<Integer> ints = getRandomInts();
            sizes += ints.size();

            long cur_time = System.currentTimeMillis();
            List<Integer> res = ListUtils.removeAll(ints, ints, false, false);
            time += System.currentTimeMillis() - cur_time;

            Assertions.assertEquals(0, res.size());
            logger.info("Run " + (i + 1) + "/" + NUM_RUNS + " finished");
        }

        logger.info("Average list size: " + (sizes / NUM_RUNS));
        logger.info("Average run time: " + (time / NUM_RUNS) + "ms");
    }

    @Test
    void randomRemoveTest() {
        final int NUM_RUNS = 10;
        final int NUM_INTEGERS = 100000;

        testBase("randomRemoveTest", NUM_RUNS, NUM_INTEGERS, TestListUtils::getFixedIntegerList,
                TestListUtils::getFixedIntegerList, false, false);
    }

    @Test
    void distinctTest() {
        final int NUM_RUNS = 10;
        final int NUM_INTEGERS = 100000;

        testBase("distinctTest", NUM_RUNS, NUM_INTEGERS, TestListUtils::getFixedIntegerList,
                TestListUtils::getFixedIntegerList, true, false);
    }

    @Test
    void alterListTest() {
        final int NUM_RUNS = 5;
        final int NUM_INTEGERS = 100000;

        testBase("alterListTest", NUM_RUNS, NUM_INTEGERS, TestListUtils::getFixedIntegerList,
                TestListUtils::getFixedIntegerList, true, true);
    }

    @Test
    void tagRemovalTest() {
        final int NUM_RUNS = 10;
        final int NUM_INTEGERS = 10000;
        testBase("tagRemovalTest", NUM_RUNS, NUM_INTEGERS, TestListUtils::generateRandomTags,
                TestListUtils::generateRandomTags, true, true);
    }
}
