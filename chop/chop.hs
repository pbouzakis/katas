import Data.Maybe
import Data.Either

-- Be Nice. This is my first haskell program ever :)

chop :: Int -> [Int] -> Int
chop num xs =
    case bin_search num xs 0 of
        Nothing -> -1
        Just index -> index


bin_search :: Int -> [Int] -> Int -> Maybe Int
bin_search _ [] _ =
    Nothing
bin_search num xs offset
    | num == middle   = Just (pivot + offset)
    | num < middle    = bin_search num (take pivot xs) offset
    | num > middle    = bin_search num (drop right_start xs) (right_start + offset)
    | otherwise       = Nothing
    where pivot = mid_index xs
          right_start = pivot + 1
          middle = xs !! pivot


mid_index :: [Int] -> Int
mid_index xs = length xs `div` 2


-- Test Runner  --------------------------------------------------

main =
    do
        putStrLn "Running Tests for Chop"
        if any (\t -> isRight t) tests
            then putStrLn "FAILED!"
            else putStrLn "Tests PASSED!"


assert :: Int -> Int -> Either String String
assert expected actual =
    if expected == actual
        then Left ("PASSED! equals " ++ show expected)
        else Right ("FAILED! Does not equal " ++ show expected)


tests :: [Either String String]
tests =
    [
        assert (-1) (chop 3 []),
        assert (-1) (chop 3 [1]),
        assert 0  (chop 1 [1]),

        assert 0  (chop 1 [1, 3, 5]),
        assert 1  (chop 3 [1, 3, 5]),
        assert 2  (chop 5 [1, 3, 5]),
        assert (-1) (chop 0 [1, 3, 5]),
        assert (-1) (chop 2 [1, 3, 5]),
        assert (-1) (chop 4 [1, 3, 5]),
        assert (-1) (chop 6 [1, 3, 5]),

        assert 0  (chop 1 [1, 3, 5, 7]),
        assert 1  (chop 3 [1, 3, 5, 7]),
        assert 2  (chop 5 [1, 3, 5, 7]),
        assert 3  (chop 7 [1, 3, 5, 7]),
        assert (-1) (chop 0 [1, 3, 5, 7]),
        assert (-1) (chop 2 [1, 3, 5, 7]),
        assert (-1) (chop 4 [1, 3, 5, 7]),
        assert (-1) (chop 6 [1, 3, 5, 7]),
        assert (-1) (chop 8 [1, 3, 5, 7])
    ]
