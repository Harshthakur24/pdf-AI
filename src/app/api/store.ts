// Global store for PDF content
export let pdfStore = {
  content: '',
  setContent(text: string) {
    this.content = text;
  },
  getContent() {
    return this.content;
  }
}; 