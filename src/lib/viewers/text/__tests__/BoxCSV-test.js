import { createRoot } from 'react-dom/client';
import BoxCSV from '../BoxCSV';

let csvComponent;

jest.mock('react-dom/client', () => ({
    createRoot: jest.fn(),
}));

describe('lib/viewers/text/BoxCSV', () => {
    beforeEach(() => {
        createRoot.mockReturnValue({
            render: jest.fn(),
            unmount: jest.fn(),
        });

        fixture.load('viewers/text/__tests__/BoxCSV-test.html');
        csvComponent = new BoxCSV(document.querySelector('.container'), {});
    });

    afterEach(() => {
        fixture.cleanup();

        if (csvComponent && typeof csvComponent.destroy === 'function') {
            csvComponent.destroy();
        }
        csvComponent = null;

        jest.resetAllMocks();
    });

    describe('getRowClassName()', () => {
        test('should return appropriate classname for row', () => {
            expect(csvComponent.getRowClassName(1)).toBe('bp-text-csv-odd-row');
            expect(csvComponent.getRowClassName(2)).toBe('bp-text-csv-even-row');
        });
    });

    describe('cellRenderer()', () => {
        test('should render cell with supplied properties', () => {
            jest.spyOn(csvComponent, 'getRowClassName').mockReturnValue('rowClass');
            csvComponent.data = [[], [], ['some', 'stuff']];

            const cell = csvComponent.cellRenderer({
                columnIndex: 1,
                key: 'key',
                rowIndex: 2,
                style: 'style',
            });

            expect(cell.props.className).toBe('rowClass bp-text-csv-cell');
            expect(cell.props.children).toBe('stuff');
            expect(cell.props.style).toBe('style');
        });
    });

    describe('renderCSV()', () => {
        test('should render Grid using calculated properties', () => {
            csvComponent.data = [
                [1, 2],
                [2, 3],
                [3, 4],
            ];

            csvComponent.renderCSV();

            const gridComponent = csvComponent.root.render.mock.calls[0][0];
            expect(gridComponent.props.className).toBe('bp-text-csv-grid');
            expect(gridComponent.props.cellRenderer).toBe(csvComponent.cellRenderer);
            expect(gridComponent.props.columnCount).toBe(2);
            expect(gridComponent.props.rowCount).toBe(3);
            expect(csvComponent.root.render).toHaveBeenCalledWith(gridComponent);
        });

        test('should base its column count on the longest available row', () => {
            csvComponent.data = [[1], [1, 2], [1, 2, 3], [1, 2, 3, 4], [1, 2]];
            csvComponent.renderCSV();

            const gridComponent = csvComponent.root.render.mock.calls[0][0];
            expect(gridComponent.props.columnCount).toBe(4);
        });
    });
});
