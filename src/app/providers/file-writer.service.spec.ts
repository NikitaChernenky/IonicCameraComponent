import { TestBed } from '@angular/core/testing';

import { FileWriterService } from './file-writer.service';

describe('FileWriterService', () => {
  let service: FileWriterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileWriterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
