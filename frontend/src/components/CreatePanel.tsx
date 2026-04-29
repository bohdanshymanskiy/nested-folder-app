import { useState } from "react";
import { Button, Card, Input, Space, Upload } from "antd";
import { FileAddOutlined, FolderAddOutlined, UploadOutlined } from "@ant-design/icons";
import { message } from "antd";
import { useCreateFile, useCreateFolder, useUpload } from "@/hooks/useFiles";
import styles from "./CreatePanel.module.scss";

export function CreatePanel() {
  const [folderName, setFolderName] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");

  const createFolder = useCreateFolder();
  const createFile = useCreateFile();
  const upload = useUpload();

  const handleCreateFolder = async () => {
    const name = folderName.trim();
    if (!name) return;
    await createFolder.mutateAsync(name);
    setFolderName("");
    message.success(`Folder "${name}" created`);
  };

  const handleCreateFile = async () => {
    const name = fileName.trim();
    if (!name) return;
    await createFile.mutateAsync({ name, content: fileContent });
    setFileName("");
    setFileContent("");
    message.success(`File "${name}" created`);
  };

  const handleUpload = async (file: File) => {
    await upload.mutateAsync(file);
    message.success(`"${file.name}" uploaded`);
  };

  return (
    <Card title="Add files" size="small" className={styles.panel}>
      <Space orientation="vertical" size={10} className={styles.row}>
        <Space.Compact className={styles.row}>
          <Input
            placeholder="Folder name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onPressEnter={handleCreateFolder}
          />
          <Button
            icon={<FolderAddOutlined />}
            onClick={handleCreateFolder}
            loading={createFolder.isPending}
          >
            New Folder
          </Button>
        </Space.Compact>

        <Space.Compact className={styles.row}>
          <Input
            placeholder="File name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            onPressEnter={handleCreateFile}
            className={styles.nameInput}
          />
          <Input
            placeholder="Content (optional)"
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
            onPressEnter={handleCreateFile}
            className={styles.contentInput}
          />
          <Button
            icon={<FileAddOutlined />}
            onClick={handleCreateFile}
            loading={createFile.isPending}
          >
            New File
          </Button>
        </Space.Compact>

        <Upload
          beforeUpload={(file) => {
            void handleUpload(file);
            return false;
          }}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />} loading={upload.isPending}>
            Upload file
          </Button>
        </Upload>
      </Space>
    </Card>
  );
}
