Compile
-------

    make

Run
-----

    ./proj2_tester

For more options:

    ./proj2_tester --help

Create a test case
------------------

You can open `test_cases.cc` to see examples. Here is one simple example:

    TEST(test_length_text, one_line_test){
        text_t* text = create_text();
        append_line(text, "foobar");
        ASSERT_EQ(length_text(text), 1);
    }

`test_length_text` and `one_line_test` are just names, the first one is used to group multiple test cases together, thus it will be convenient to run a group of test cases.

To test the result, use `ASSERT_*` macros, if the assertion fails, the test case fails. Here are some basic ASSERT macros:
* ASSERT_TRUE(condition);
* ASSERT_FALSE(condition);
* ASSERT_EQ(val1,val2);
* ASSERT_NE(val1,val2);
* ASSERT_LT(val1,val2);
* ASSERT_LE(val1,val2);
* ASSERT_GT(val1,val2);
* ASSERT_GE(val1,val2);

For complete list, please refer [Assertions](https://github.com/google/googletest/blob/master/googletest/docs/Primer.md#assertions) and [More Assertions](https://github.com/google/googletest/blob/master/googletest/docs/AdvancedGuide.md#more-assertions) in documents of googletest

Integrate with students' submission
-----------------------------------
`naive_implementation.cc` is a simple implementation just for the purpose of testing our test cases, it is naive, and has bugs of course.

If we need to test a submission, just remove `naive_implementation.cc` and add students' code in. To be compatible with this test framework, students must use `API.h` and follow the class name and function signatures defined in it.

googletest documents
--------------------
[Introduction: Why Google C++ Testing Framework?](https://github.com/google/googletest/blob/master/googletest/docs/Primer.md#introduction-why-google-c-testing-framework)

[Advanced Guide](https://github.com/google/googletest/blob/master/googletest/docs/AdvancedGuide.md)
