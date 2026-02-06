const getFileIcon = (type) => {
  if (type?.includes('image')) return 'file-image';
  if (type?.includes('pdf')) return 'file-pdf-box';
  if (type?.includes('word') || type?.includes('document')) return 'file-document';
  return 'file';
};

export { getFileIcon };