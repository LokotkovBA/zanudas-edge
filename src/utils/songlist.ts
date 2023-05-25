import { type Song } from "~/drizzle/types";

export function exportJSON(songListData: Song[]) {
    const jsonStringData = `data:text/json;chatset=utf8,${encodeURIComponent(
        JSON.stringify(songListData),
    )}`;
    const link = document.createElement("a");
    link.href = jsonStringData;
    link.download = "songList.json";

    link.click();
}

export function splitByArtist(
    artistFirstLetters: string[],
    list?: Song[],
): Song[][] {
    artistFirstLetters.length = 0;
    const result: Song[][] = [];
    if (list === undefined || list.length === 0) return result;

    let curArtist = list[0]?.artist;
    let curArtistArray: Song[] = [];
    for (const song of list) {
        if (song.artist !== curArtist) {
            result.push(curArtistArray);
            curArtistArray = [];
            curArtist = song.artist;
        }
        curArtistArray.push(song);
    }
    result.push(curArtistArray);

    const firstBlock = result[0];
    if (!firstBlock) {
        return result;
    }

    const firstArtistFirstLetter = firstBlock[0]?.artist[0];
    if (!firstArtistFirstLetter) {
        return result;
    }

    artistFirstLetters.push(firstArtistFirstLetter);
    let letterIndex = 0;
    for (const block of result) {
        const curArtistFirstLetter = block[0]?.artist[0];
        if (
            curArtistFirstLetter &&
            artistFirstLetters[letterIndex] !== curArtistFirstLetter
        ) {
            artistFirstLetters.push(curArtistFirstLetter);
            letterIndex++;
        }
    }

    return result;
}

export function filterByCategorySonglist(
    selectedCategoryIndex: number,
    categories: string[],
    songList?: Song[],
) {
    const selectedCategory = categories[selectedCategoryIndex];
    return selectedCategory === undefined
        ? songList
        : songList?.filter(({ tag }) => {
              return selectedCategoryIndex === -1
                  ? true
                  : tag?.includes(selectedCategory.toLowerCase());
          });
}

export function filterBySearch(search: string | null, songlist?: Song[]) {
    return songlist?.filter(({ artist, songName, tag }) => {
        if (!search) return true;
        const lowerSearch = search.toLowerCase();
        const lowerArtist = artist.toLowerCase();
        const lowerSongName = songName.toLowerCase();

        return (
            lowerSearch === "" ||
            lowerArtist.includes(lowerSearch) ||
            lowerSongName.includes(lowerSearch) ||
            tag?.includes(lowerSearch) ||
            `${lowerArtist} - ${lowerSongName}`.includes(lowerSearch) ||
            `${lowerArtist} ${lowerSongName}`.includes(lowerSearch)
        );
    });
}
