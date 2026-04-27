import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { appStore } from "@/stores/appStore";
import type { NodeItem, Permission } from "@/types";

export const FILES_QUERY_KEY = "files";

export function useNodes() {
  return useQuery({
    queryKey: [FILES_QUERY_KEY, appStore.currentParentId, appStore.search],
    queryFn: () =>
      api
        .get<NodeItem[]>("/files", {
          params: {
            parentId: appStore.currentParentId ?? undefined,
            q: appStore.search || undefined,
          },
        })
        .then((r) => r.data),
    enabled: !!appStore.token,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: [FILES_QUERY_KEY] });
}

export function useCreateFolder() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (name: string) =>
      api.post("/files/folder", { parentId: appStore.currentParentId, name }),
    onSuccess: invalidate,
  });
}

export function useCreateFile() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ name, content }: { name: string; content: string }) =>
      api.post("/files/file", { parentId: appStore.currentParentId, name, content }),
    onSuccess: invalidate,
  });
}

export function useUpload() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      if (appStore.currentParentId) form.append("parentId", appStore.currentParentId);
      return api.post("/files/upload", form);
    },
    onSuccess: invalidate,
  });
}

export function useRename() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      api.patch(`/files/${id}/rename`, { name }),
    onSuccess: invalidate,
  });
}

export function useDeleteNode() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/files/${id}`),
    onSuccess: invalidate,
  });
}

export function useClone() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => api.post(`/files/${id}/clone`),
    onSuccess: invalidate,
  });
}

export function useToggleVisibility() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, isPublic }: { id: string; isPublic: boolean }) =>
      api.patch(`/files/${id}/visibility`, { isPublic }),
    onSuccess: invalidate,
  });
}

export function useShare() {
  return useMutation({
    mutationFn: ({
      id,
      email,
      permission,
    }: {
      id: string;
      email: string;
      permission: Permission;
    }) => api.post(`/files/${id}/share`, { email, permission }),
  });
}

export function useReorder() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (order: string[]) =>
      api.post("/files/reorder", { parentId: appStore.currentParentId, order }),
    onSuccess: invalidate,
  });
}

export function useDownload() {
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data } = await api.get<Blob>(`/files/${id}/download`, { responseType: "blob" });
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  });
}
