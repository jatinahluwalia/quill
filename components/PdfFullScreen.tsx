'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { ExpandIcon, Loader2 } from 'lucide-react';
import SimpleBar from 'simplebar-react';
import { toast } from 'sonner';
import { Document, Page } from 'react-pdf';

interface Props {
  url: string;
}

const PdfFullScreen = ({ url }: Props) => {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(1);
  const [numPages, setNumPages] = useState<number>();

  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const handleWidth = useCallback(() => {
    if (pdfContainerRef.current) {
      setWidth(pdfContainerRef.current.clientWidth);
    }
  }, [pdfContainerRef]);

  useEffect(() => {
    handleWidth();
    window.addEventListener('resize', handleWidth);
    return () => window.removeEventListener('resize', handleWidth);
  }, [handleWidth]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button aria-label="fullscreen" variant={'ghost'}>
          <ExpandIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-7xl">
        <SimpleBar autoHide={false} className="mt-6 max-h-[calc(100vh-10rem)]">
          <div ref={pdfContainerRef}>
            <Document
              loading={
                <div className="flex justify-center">
                  <Loader2 className="my-24 h-5 w-6 animate-spin" />
                </div>
              }
              onLoadError={() =>
                toast.error('Error loading pdf.', {
                  description: 'Please try again later.',
                })
              }
              file={url}
              className={'max-h-full'}
              onLoadSuccess={({ numPages }) => {
                handleWidth();
                setNumPages(numPages);
              }}
            >
              {Array.from({ length: numPages! }).map((_, i) => (
                <Page key={i} width={width} pageNumber={i + 1} />
              ))}
            </Document>
          </div>
        </SimpleBar>
      </DialogContent>
    </Dialog>
  );
};

export default PdfFullScreen;
