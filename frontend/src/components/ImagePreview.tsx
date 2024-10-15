import useDownloadFileBatch from "@/hooks/useDownloadFileBatch";
import { BATCH_SIZE } from "@/lib/constants";
import { DirectoryItemType } from "@/lib/types";
import { useState } from "react";
import Viewer from "react-viewer";

interface ImageViewerProps {
  currentPath: string;
  currentFileIndex: number;
  directoryList: DirectoryItemType[];
  show: boolean;
  close: () => void;
}

const ImageViewer = ({
  currentPath,
  currentFileIndex,
  directoryList,
  show,
  close,
}: ImageViewerProps) => {
  const [activeIndex, setActiveIndex] = useState(() => {
    if (currentFileIndex < BATCH_SIZE) {
      return currentFileIndex;
    }
    return 0;
  });

  const { data, isLoading, fetchNextPage } = useDownloadFileBatch({
    files: directoryList,
    folderPath: currentPath,
    currentIndex: currentFileIndex,
  });

  const pageList = !isLoading
    ? data?.pages.reduce((initPage, nextPage) => {
        if (initPage && nextPage) {
          return initPage?.concat(nextPage);
        }
        return [];
      })
    : [];

  const images = !isLoading
    ? pageList?.map((image) => ({ src: image?.url ?? "", alt: "" }))
    : [];

  const handleImageChange = (newIndex: number) => {
    if (images && newIndex === images.length - 2) {
      fetchNextPage();
      setActiveIndex(newIndex);
    }
  };

  return (
    <div>
      {!isLoading && images?.length !== 0 && (
        <Viewer
          visible={show}
          onClose={() => {
            close();
          }}
          loop={false}
          activeIndex={activeIndex}
          images={images}
          downloadable
          downloadInNewWindow
          onChange={(_, newIndex) => handleImageChange(newIndex)}
        />
      )}
    </div>
  );
};

export default ImageViewer;
