'use client';

import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCw,
  Search,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Simplebar from 'simplebar-react';
import PdfFullScreen from './PdfFullScreen';

interface Props {
  url: string;
}

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PdfRenderer = ({ url }: Props) => {
  const [width, setWidth] = useState(1);
  const [numPages, setNumPages] = useState<number>();
  const [currPage, setCurrPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [renderedScale, setRenderedScale] = useState<number | null>(null);

  const isLoading = renderedScale !== scale;

  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const pageSchema = z.object({
    page: z
      .number({ invalid_type_error: 'Must be number only!' })
      .min(1)
      .max(numPages!),
  });

  type PageSchema = z.infer<typeof pageSchema>;

  const form = useForm<PageSchema>({
    defaultValues: {
      page: currPage,
    },
    resolver: zodResolver(pageSchema),
  });

  const onSubmit = (values: PageSchema) => {
    const { page } = values;
    setCurrPage(page);
  };

  const handleWidth = useCallback(() => {
    if (pdfContainerRef.current) {
      setWidth(pdfContainerRef.current.clientWidth);
    }
  }, []);

  useEffect(() => {
    handleWidth();
    window.addEventListener('resize', handleWidth);
    return () => window.removeEventListener('resize', handleWidth);
  }, [handleWidth]);

  return (
    <div className="flex w-full flex-col items-center rounded-md bg-white shadow">
      <div className="flex h-14 w-full items-center justify-between border-b border-zinc-200 px-2">
        <div className="flex items-center gap-1.5">
          <Button
            aria-label="previous page"
            variant={'ghost'}
            onClick={() =>
              setCurrPage((prev) => {
                const page = prev > 1 ? prev - 1 : 1;
                form.setValue('page', page);
                return page;
              })
            }
            disabled={currPage <= 1}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            <Input
              className={cn(
                'h-8 w-12',
                form.formState.errors.page && 'focus-visible:ring-red-500',
              )}
              {...form.register('page', { valueAsNumber: true })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  form.handleSubmit(onSubmit)();
                }
              }}
            />
            <p className="space-x-1 text-sm text-zinc-700">
              <span>/</span>
              <span>{numPages ?? 'x'}</span>
            </p>
          </div>
          <Button
            aria-label="next page"
            variant={'ghost'}
            onClick={() =>
              setCurrPage((prev) => {
                const page = prev < numPages! ? prev + 1 : numPages!;
                form.setValue('page', page);
                return page;
              })
            }
            disabled={numPages === undefined || currPage >= numPages!}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-1.5" aria-label="zoom" variant={'ghost'}>
                <Search className="h-4 w-4" />
                {scale * 100}%<ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setScale(1)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.5)}>
                150%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2)}>
                200%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2.5)}>
                250%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            aria-label="rotate 90 degress"
            variant={'ghost'}
            onClick={() => setRotation((prev) => prev + 90)}
          >
            <RotateCw className="h-4 w-4" />
          </Button>

          <PdfFullScreen url={url} />
        </div>
      </div>

      <div className="max-h-screen w-full flex-1 ">
        <Simplebar autoHide={false} className="max-h-[calc(100vh-10rem)]">
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
                setNumPages(numPages);
              }}
            >
              {isLoading && renderedScale && (
                <Page
                  width={width}
                  pageNumber={currPage}
                  scale={scale}
                  rotate={rotation}
                  key={`@${renderedScale}`}
                />
              )}
              <Page
                className={cn(isLoading ? 'hidden' : '')}
                width={width}
                pageNumber={currPage}
                scale={scale}
                rotate={rotation}
                key={`@${scale}`}
                loading={
                  <div className="flex justify-center">
                    <Loader2 className="my-24 h-6 w-6 animate-spin" />
                  </div>
                }
                onRenderSuccess={() => {
                  setRenderedScale(scale);
                }}
              />
            </Document>
          </div>
        </Simplebar>
      </div>
    </div>
  );
};

export default PdfRenderer;
