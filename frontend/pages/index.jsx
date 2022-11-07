import React, { useRef, useState } from "react";
import {
  Box,
  chakra,
  Collapse,
  Flex,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import debounce from "lodash/debounce";
import PageLayout from "../components/Layout/PageLayout";
import SearchBar from "../components/SearchBar";
import SearchResults from "../components/SearchResults";

const DURATIONS = {
  enter: 0.3,
  exit: 0.75,
};

const Home = () => {
  const [search, setSearch] = useState("");
  const [showLandingPage, setShowLandingPage] = useState(true);

  const [searchResults, setSearchResults] = useState(null);
  const debouncedShowLandingPage = useRef(
    debounce(() => {
      setShowLandingPage(true);
    }, 750)
  ).current;

  const debouncedSearch = useRef(
    debounce((text) => {
      fetch(`/api/search?q=${text}`)
        .then((r) => r.json())
        .then((data) => setSearchResults(data));
    }, 500)
  ).current;

  const handleChange = (value) => {
    setSearch(value);
    setShowLandingPage(false);
    if (value === "") {
      debouncedShowLandingPage();
      debouncedSearch.cancel();
    } else {
      setSearchResults(null);
      debouncedShowLandingPage.cancel();
      debouncedSearch(value);
    }
  };
  return (
    <PageLayout>
      <Flex
        alignItems={"start"}
        justifyContent={"space-between"}
        flexDirection={["column-reverse", "row", "row"]}
      >
        <VStack alignItems={["center", "start", "start"]} spacing={[0, 8, 8]}>
          <Collapse
            unmountOnExit={false}
            in={showLandingPage}
            startingHeight={0.01}
            animateOpacity
            transition={{
              exit: { duration: DURATIONS.exit },
              enter: { duration: DURATIONS.enter },
            }}
          >
            <Heading
              fontSize={["50px", "55px", "90px"]}
              paddingTop={[0, 10, "calc(50vh - 185px)"]}
              textAlign={["center", "left", "left"]}
            >
              Gopher Grades
            </Heading>
            <Text
              maxW={["100%", "50%", "100%"]}
              style={{
                color: "black",
              }}
              textAlign={["center", "left", "left"]}
              py={[8, 10, 2]}
              fontWeight={300}
            >
              View all the past grades for classes taken at the University of
              Minnesota, Twin Cities.
            </Text>
          </Collapse>
          <Box pt={[0, 5, 2]} maxW={"calc(100vw - 50px)"} width={"100%"}>
            <SearchBar onChange={handleChange} />
          </Box>
        </VStack>
        <Box ml={[0, -200, -75]} zIndex={-1}>
          <Collapse
            in={showLandingPage}
            transition={{
              exit: { duration: DURATIONS.exit / 2 },
              enter: {
                duration: (3 * DURATIONS.enter) / 4,
                delay: DURATIONS.enter / 4,
              },
            }}
          >
            <Box
              pt={[0, 0, showLandingPage ? "calc(50vh - 267px)" : "5px"]}
              width={"650px"}
              transitionDuration={"0.2s"}
              transitionDelay={"0.2s"}
              maxW={["75vw", "50vw", "50vw"]}
              opacity={0.34}
              style={{
                aspectRatio: "1762/1403",
              }}
              alignSelf={"center"}
            >
              <chakra.img
                src={"images/Goldy.png"}
                alt={""}
                style={{
                  aspectRatio: "1762/1403",
                }}
              />
            </Box>
          </Collapse>
        </Box>
      </Flex>
      <Collapse
        in={!showLandingPage}
        transition={{
          exit: { duration: DURATIONS.enter },
          enter: {
            duration: (3 * DURATIONS.exit) / 4,
            delay: DURATIONS.exit / 8,
          },
        }}
      >
        <SearchResults search={search} searchResults={searchResults} />
      </Collapse>
    </PageLayout>
  );
};

export default Home;
