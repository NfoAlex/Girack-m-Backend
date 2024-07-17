export interface IFile {
  id: string,
  userId: string,
  name: string,
  isPublic: boolean,
  size: number,
  directory: string,
  uploadedDate: string
}

export interface IFolder {
  id: string,
  userId: string,
  name: string,
  positionedDirectory: string
}