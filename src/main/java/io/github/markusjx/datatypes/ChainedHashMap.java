package io.github.markusjx.datatypes;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * A chained hash map. Basically a {@code HashMap<K, List<V>>}
 *
 * @param <K> the map key type
 * @param <V> the map list value type
 */
public class ChainedHashMap<K, V> extends HashMap<K, List<V>> {
    /**
     * Create a new chained hash map
     */
    public ChainedHashMap() {
        super();
    }

    /**
     * Create a {@link ChainedHashMap} from a argument array.
     * The argument array length must be a multiple of two.
     *
     * @param args the argument array
     * @param <T>  the map type
     * @return the resulting map
     */
    @SafeVarargs
    public static <T> ChainedHashMap<T, T> of(T... args) {
        if (args.length % 2 != 0) {
            throw new IllegalArgumentException("The length of args must be a multiple of two");
        }

        ChainedHashMap<T, T> res = new ChainedHashMap<>();
        for (int i = 0; i < args.length; i += 2) {
            res.putValue(args[i], args[i + 1]);
        }

        return res;
    }

    /**
     * Create a {@link ChainedHashMap} from a string array
     *
     * @param args the string array
     * @return the resulting map
     */
    @SuppressWarnings("unused")
    public static ChainedHashMap<String, String> fromStringArray(String... args) {
        return ChainedHashMap.of(args);
    }

    /**
     * Put a value in the hash map.
     * If a key already exists, the value will be appended to the value list
     *
     * @param key   the key to add
     * @param value the value to add
     */
    public void putValue(K key, V value) {
        if (super.containsKey(key)) {
            super.get(key).add(value);
        } else {
            List<V> list = new ArrayList<>();
            list.add(value);
            super.put(key, list);
        }
    }
}
