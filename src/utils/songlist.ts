import type { Block, Song } from "~/drizzle/types";

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
): Block[] {
    artistFirstLetters.length = 0;
    const result: Block[] = [];
    if (list === undefined || list.length === 0) return result;

    let curArtist = list[0]?.artist;
    let curArtistArray: Song[] = [];
    for (const song of list) {
        if (song.artist !== curArtist) {
            result.push({
                songs: curArtistArray,
                letter: curArtist?.[0] ?? "",
            });
            curArtistArray = [];
            curArtist = song.artist;
        }
        curArtistArray.push(song);
    }
    result.push({
        songs: curArtistArray,
        letter: curArtist?.[0] ?? "",
    });

    let prevLetter = "";

    for (const block of result) {
        if (prevLetter === block.letter) {
            continue;
        }

        prevLetter = block.letter;
        artistFirstLetters.push(prevLetter);
        block.letter += "/first";
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
