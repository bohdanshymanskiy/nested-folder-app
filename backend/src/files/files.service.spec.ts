import { FilesService } from "./files.service";
import { UsersService } from "../users/users.service";

const mockUsersService = {
  findById: (id: string) => ({ id, email: `${id}@test.com`, password: "" }),
  findByEmail: () => undefined,
  create: () => ({ id: "x", email: "x@test.com", password: "" }),
} as unknown as UsersService;

describe("FilesService", () => {
  let service: FilesService;

  beforeEach(() => {
    service = new FilesService(mockUsersService);
  });

  it("creates and lists folders", () => {
    const folder = service.createFolder("user-1", null, "Projects");
    const list = service.listForUser("user-1", null, "");
    expect(folder.name).toBe("Projects");
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(folder.id);
  });

  it("clones file for same user", () => {
    const file = service.createFile("user-1", null, "readme.txt", "hello");
    const clone = service.clone("user-1", file.id);
    expect(clone.name).toContain("(copy)");
    expect(clone.id).not.toBe(file.id);
  });

  it("[SEC][UC-003] user cannot access another user's private file", () => {
    service.createFile("user-1", null, "secret.txt", "private");
    const listForUser2 = service.listForUser("user-2", null, "");
    expect(listForUser2).toHaveLength(0);
  });

  it("[SEC][UC-008] viewer share cannot rename", () => {
    const file = service.createFile("user-1", null, "readme.txt", "hello");
    service.shareByEmail("user-1", file.id, "user-2@test.com", "viewer");
    expect(() => service.rename("user-2", file.id, "new-name")).toThrow();
  });

  it("[UC-008] editor share can rename", () => {
    const file = service.createFile("user-1", null, "readme.txt", "hello");
    service.shareByEmail("user-1", file.id, "user-2@test.com", "editor");
    const renamed = service.rename("user-2", file.id, "new-name");
    expect(renamed.name).toBe("new-name");
  });

  it("uploadFile creates node with rawBuffer and mimeType, no content", () => {
    const buffer = Buffer.from("fake-image-data");
    const node = service.uploadFile("user-1", null, "photo.png", buffer, "image/png");
    expect(node.rawBuffer).toBe(buffer);
    expect(node.mimeType).toBe("image/png");
    expect(node.content).toBeUndefined();
    expect(node.type).toBe("file");
    const list = service.listForUser("user-1", null, "");
    expect(list.some((n) => n.id === node.id)).toBe(true);
  });

  it("getFileBuffer returns buffer and metadata for owner", () => {
    const buffer = Buffer.from("pdf-bytes");
    const node = service.uploadFile("user-1", null, "doc.pdf", buffer, "application/pdf");
    const result = service.getFileBuffer("user-1", node.id);
    expect(result.buffer).toBe(buffer);
    expect(result.mimeType).toBe("application/pdf");
    expect(result.name).toBe("doc.pdf");
  });

  it("getFileBuffer throws for another user's node", () => {
    const buffer = Buffer.from("secret");
    const node = service.uploadFile("user-1", null, "secret.png", buffer, "image/png");
    expect(() => service.getFileBuffer("user-2", node.id)).toThrow();
  });

  it("getFileBuffer throws BadRequestException for text node", () => {
    const file = service.createFile("user-1", null, "readme.txt", "hello");
    expect(() => service.getFileBuffer("user-1", file.id)).toThrow();
  });
});
