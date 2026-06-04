import { TestBed } from '@angular/core/testing';

import { HeaderService } from './header.service';

describe('HeaderService', () => {
    let service: HeaderService;

    beforeEach(() => {
        TestBed.configureTestingModule({ teardown: { destroyAfterEach: true } });
        service = TestBed.inject(HeaderService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
