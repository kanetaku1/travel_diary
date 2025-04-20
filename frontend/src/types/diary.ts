export interface Photo {
  id: number;
  file_url: string;
}

export interface DiaryEntry {
  id: number;
  title: string;
  content: string;
  created_at: string;
  tags: string[];
  photos: Photo[];
}
