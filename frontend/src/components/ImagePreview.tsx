import useDownloadFileBatch from "@/hooks/useDownloadFileBatch";
import { DirectoryItemType } from "@/lib/types";
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
  const { data, isLoading } = useDownloadFileBatch({
    files: directoryList,
    folderPath: currentPath,
  });

  const images = data?.map((image) => ({ src: image.url, alt: "" }));

  return (
    <div>
      {!isLoading && (
        <Viewer
          visible={show}
          onClose={() => {
            close();
          }}
          activeIndex={currentFileIndex}
          images={images}
          attribute={false}
          scalable={false}
        />
      )}
    </div>
  );
};

export default ImageViewer;
