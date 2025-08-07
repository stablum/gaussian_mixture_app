import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import FileUploadBase from '@/components/ui/FileUploadBase';

// Mock components
jest.mock('@/components/ui/CollapsiblePanel', () => {
  return function MockCollapsiblePanel({ title, children }: any) {
    return <div data-testid="collapsible-panel" data-title={title}>{children}</div>;
  };
});

jest.mock('@/components/ui/Button', () => {
  return function MockButton({ children, onClick, variant, size }: any) {
    return (
      <button 
        onClick={onClick} 
        data-variant={variant} 
        data-size={size}
        data-testid="button"
      >
        {children}
      </button>
    );
  };
});

// Test interfaces
interface TestData {
  value: number;
}

interface TestConfig {
  totalPoints?: number;
  preset?: string;
}

interface TestCustomConfig {
  customValue: number;
}

describe('FileUploadBase', () => {
  const mockParseCSV = jest.fn<TestData[], [string]>();
  const mockGenerateSampleData = jest.fn<TestData[], [Partial<TestConfig>]>();
  const mockOnDataLoad = jest.fn<void, [TestData[]]>();

  const defaultProps = {
    title: 'Test Upload',
    uploadButtonText: 'Upload Test File',
    generateButtonText: 'Generate Test Data',
    acceptedFileTypes: '.csv,.txt',
    description: 'Test description',
    onDataLoad: mockOnDataLoad,
    parseCSV: mockParseCSV,
    generateSampleData: mockGenerateSampleData,
    initialConfig: { totalPoints: 100, preset: 'test' },
    initialCustomConfig: { customValue: 42 },
    presetDescriptions: {
      test: 'Test preset description',
      custom: 'Custom configuration'
    },
    invalidDataMessage: 'Invalid test data'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with correct title and buttons', () => {
    render(<FileUploadBase {...defaultProps} />);

    expect(screen.getByTestId('collapsible-panel')).toHaveAttribute('data-title', 'Test Upload');
    expect(screen.getByText('Upload Test File')).toBeInTheDocument();
    expect(screen.getByText('Generate Test Data')).toBeInTheDocument();
    expect(screen.getByText('▼ Options')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<FileUploadBase {...defaultProps} />);
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('shows advanced options when options button is clicked', () => {
    render(<FileUploadBase {...defaultProps} />);

    const optionsButton = screen.getByText('▼ Options');
    fireEvent.click(optionsButton);

    expect(screen.getByText('Number of Data Points')).toBeInTheDocument();
    expect(screen.getByText('Distribution Preset')).toBeInTheDocument();
    expect(screen.getByText('▲ Options')).toBeInTheDocument();
  });

  it('calls generateSampleData when generate button is clicked', () => {
    const testData = [{ value: 1 }, { value: 2 }];
    mockGenerateSampleData.mockReturnValue(testData);

    render(<FileUploadBase {...defaultProps} />);

    const generateButton = screen.getByText('Generate Test Data');
    fireEvent.click(generateButton);

    expect(mockGenerateSampleData).toHaveBeenCalledWith({
      totalPoints: 100,
      preset: 'test'
    });
    expect(mockOnDataLoad).toHaveBeenCalledWith(testData);
  });

  it('handles file upload correctly', async () => {
    const csvText = '1\n2\n3';
    const testData = [{ value: 1 }, { value: 2 }, { value: 3 }];
    mockParseCSV.mockReturnValue(testData);

    render(<FileUploadBase {...defaultProps} />);

    const file = new File([csvText], 'test.csv', { type: 'text/csv' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(mockParseCSV).toHaveBeenCalledWith(csvText);
      expect(mockOnDataLoad).toHaveBeenCalledWith(testData);
    });
  });

  it('shows alert when parsing empty CSV', async () => {
    const csvText = 'empty';
    mockParseCSV.mockReturnValue([]);
    
    // Mock window.alert
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<FileUploadBase {...defaultProps} />);

    const file = new File([csvText], 'empty.csv', { type: 'text/csv' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Invalid test data');
    });

    alertSpy.mockRestore();
  });

  it('shows alert when CSV parsing fails', async () => {
    const csvText = 'invalid';
    const error = new Error('Parse error');
    mockParseCSV.mockImplementation(() => {
      throw error;
    });
    
    // Mock window.alert
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<FileUploadBase {...defaultProps} />);

    const file = new File([csvText], 'invalid.csv', { type: 'text/csv' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error parsing CSV file: Parse error');
    });

    alertSpy.mockRestore();
  });

  it('updates configuration when form inputs change', () => {
    render(<FileUploadBase {...defaultProps} />);

    // Show advanced options
    const optionsButton = screen.getByText('▼ Options');
    fireEvent.click(optionsButton);

    // Find and update the number input
    const numberInput = screen.getByDisplayValue('100');
    fireEvent.change(numberInput, { target: { value: '200' } });

    // Find and update the select
    const select = screen.getByDisplayValue('test');
    fireEvent.change(select, { target: { value: 'custom' } });

    // Generate data to verify config was updated
    const testData = [{ value: 1 }];
    mockGenerateSampleData.mockReturnValue(testData);

    const generateButton = screen.getByText('Generate Test Data');
    fireEvent.click(generateButton);

    expect(mockGenerateSampleData).toHaveBeenCalledWith({
      totalPoints: 200,
      preset: 'custom'
    });
  });

  it('renders custom config fields when preset is custom', () => {
    const customConfigFields = <div data-testid="custom-fields">Custom fields content</div>;
    
    render(
      <FileUploadBase 
        {...defaultProps} 
        customConfigFields={customConfigFields}
        initialConfig={{ totalPoints: 100, preset: 'custom' }}
      />
    );

    // Show advanced options
    const optionsButton = screen.getByText('▼ Options');
    fireEvent.click(optionsButton);

    expect(screen.getByTestId('custom-fields')).toBeInTheDocument();
  });

  it('does not render custom config fields when preset is not custom', () => {
    const customConfigFields = <div data-testid="custom-fields">Custom fields content</div>;
    
    render(
      <FileUploadBase 
        {...defaultProps} 
        customConfigFields={customConfigFields}
        initialConfig={{ totalPoints: 100, preset: 'test' }}
      />
    );

    // Show advanced options
    const optionsButton = screen.getByText('▼ Options');
    fireEvent.click(optionsButton);

    expect(screen.queryByTestId('custom-fields')).not.toBeInTheDocument();
  });

  it('shows correct preset description', () => {
    render(<FileUploadBase {...defaultProps} />);

    // Show advanced options
    const optionsButton = screen.getByText('▼ Options');
    fireEvent.click(optionsButton);

    expect(screen.getByText(/Selected:.*Test preset description.*\(100 points\)/)).toBeInTheDocument();
  });

  it('handles file input correctly with different file types', () => {
    render(<FileUploadBase {...defaultProps} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toHaveAttribute('accept', '.csv,.txt');
  });
});